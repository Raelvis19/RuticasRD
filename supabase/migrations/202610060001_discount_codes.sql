-- Apply after 202609060001. Additive migration; existing reservations keep their totals.
begin;
create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9-]{4,40}$'),
  tour_id uuid not null references public.tours(id) on delete cascade,
  kind text not null check (kind in ('fixed', 'free_seat')),
  amount numeric(12,2) not null default 0,
  max_uses integer not null default 1 check (max_uses between 1 and 10000),
  expires_at timestamptz,
  winner_email text check (winner_email is null or (length(winner_email) <= 180 and winner_email = lower(trim(winner_email)))),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check ((kind = 'fixed' and amount > 0) or (kind = 'free_seat' and amount = 0))
);
alter table public.reservations
  add column original_amount numeric(12,2) generated always as (price_per_person * participant_count) stored,
  add column discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  add column discount_code text,
  add column discount_kind text;
create table public.discount_redemptions (
  id uuid primary key default gen_random_uuid(),
  discount_id uuid not null references public.discount_codes(id) on delete cascade,
  reservation_id uuid unique references public.reservations(id) on delete set null,
  reservation_code text not null,
  released_at timestamptz,
  released_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index discount_redemptions_usage on public.discount_redemptions(discount_id) where released_at is null;
alter table public.discount_codes enable row level security;
alter table public.discount_redemptions enable row level security;
create policy discount_admin_read on public.discount_codes for select to authenticated using ((select public.is_admin()));
create policy redemption_admin_read on public.discount_redemptions for select to authenticated using ((select public.is_admin()));
-- Mutations use checked functions, never direct browser table writes.
revoke all on public.discount_codes, public.discount_redemptions from anon, authenticated;
grant select on public.discount_codes, public.discount_redemptions to authenticated;

create function public.preview_reservation_discount(p_tour_id uuid, p_code text, p_count integer, p_email text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare t public.tours%rowtype; d public.discount_codes%rowtype; reduction numeric; subtotal numeric; deposit numeric;
begin
  if p_count is null or p_count not between 1 and 50 then raise exception 'invalid_participant_count'; end if;
  -- All redemption paths lock tour before discount, including reservation creation.
  select * into t from public.tours where id=p_tour_id for update;
  if not found or t.status <> 'publicado' or t.reservation_deadline < now() then raise exception 'tour_not_available'; end if;
  select * into d from public.discount_codes where code=upper(trim(p_code)) and tour_id=p_tour_id for update;
  if not found or not d.is_active or (d.expires_at is not null and d.expires_at <= now())
    or (d.winner_email is not null and d.winner_email <> lower(trim(coalesce(p_email,'')))) then
    raise exception 'discount_unavailable';
  end if;
  if (select count(*) from public.discount_redemptions where discount_id=d.id and released_at is null) >= d.max_uses then
    raise exception 'discount_unavailable';
  end if;
  subtotal := t.price*p_count;
  reduction := least(subtotal, case when d.kind='free_seat' then t.price else d.amount end);
  deposit := least(subtotal-reduction, t.deposit_amount * (p_count - case when d.kind='free_seat' then 1 else 0 end));
  return jsonb_build_object('originalAmount',subtotal,'discountAmount',reduction,'totalAmount',subtotal-reduction,
    'requiredDeposit',deposit,'discountCode',d.code,'discountKind',d.kind);
end; $$;
revoke all on function public.preview_reservation_discount(uuid,text,integer,text) from public;
grant execute on function public.preview_reservation_discount(uuid,text,integer,text) to anon,authenticated;

create function public.create_discounted_reservation(p_tour_id uuid, p_customer jsonb, p_participants jsonb, p_discount_code text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare quote jsonb; result_code text; reservation public.reservations%rowtype; discount_id_value uuid;
begin
  if p_participants is null or jsonb_typeof(p_participants) <> 'array' then raise exception 'invalid_participants'; end if;
  if nullif(trim(p_discount_code),'') is not null then
    quote := public.preview_reservation_discount(p_tour_id,p_discount_code,jsonb_array_length(p_participants),p_customer->>'email');
  end if;
  -- Reuse established customer, participant, deadline, duplicate and capacity validation.
  result_code := public.create_public_reservation(p_tour_id,p_customer,p_participants);
  select * into reservation from public.reservations where reservation_code=result_code;
  if quote is not null then
    update public.reservations set discount_code=quote->>'discountCode', discount_kind=quote->>'discountKind',
      discount_amount=(quote->>'discountAmount')::numeric, total_amount=(quote->>'totalAmount')::numeric,
      required_deposit=(quote->>'requiredDeposit')::numeric where id=reservation.id;
    select id into discount_id_value from public.discount_codes where code=quote->>'discountCode';
    insert into public.discount_redemptions(discount_id,reservation_id,reservation_code)
      values(discount_id_value,reservation.id,result_code);
  else
    quote := jsonb_build_object('originalAmount',reservation.original_amount,'discountAmount',0,
      'totalAmount',reservation.total_amount,'requiredDeposit',reservation.required_deposit,'discountCode',null,'discountKind',null);
  end if;
  return quote || jsonb_build_object('code',result_code);
end; $$;
revoke all on function public.create_discounted_reservation(uuid,jsonb,jsonb,text) from public;
grant execute on function public.create_discounted_reservation(uuid,jsonb,jsonb,text) to anon,authenticated;

create function public.admin_save_discount(p_id uuid, p_code text, p_tour_id uuid, p_kind text, p_amount numeric,
  p_max_uses integer, p_expires_at timestamptz, p_winner_email text, p_is_active boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'administrator_access_required' using errcode='42501'; end if;
  if p_id is not null then
    perform 1 from public.discount_codes where id=p_id for update;
    if not found then raise exception 'discount_not_found'; end if;
    if p_max_uses < (select count(*) from public.discount_redemptions where discount_id=p_id and released_at is null) then
      raise exception 'discount_limit_below_usage';
    end if;
    -- Identity and reward remain stable once issued; expiry, limit and activation can change.
    if exists(select 1 from public.discount_redemptions where discount_id=p_id) and exists (
      select 1 from public.discount_codes where id=p_id and
      (code is distinct from upper(trim(p_code)) or tour_id is distinct from p_tour_id or kind is distinct from p_kind
       or amount is distinct from p_amount or winner_email is distinct from nullif(lower(trim(p_winner_email)),''))) then
      raise exception 'discount_already_used';
    end if;
    update public.discount_codes set code=upper(trim(p_code)),tour_id=p_tour_id,kind=p_kind,amount=p_amount,
      max_uses=p_max_uses,expires_at=p_expires_at,winner_email=nullif(lower(trim(p_winner_email)),''),is_active=p_is_active where id=p_id;
  else
    insert into public.discount_codes(code,tour_id,kind,amount,max_uses,expires_at,winner_email,is_active)
      values(upper(trim(p_code)),p_tour_id,p_kind,p_amount,p_max_uses,p_expires_at,nullif(lower(trim(p_winner_email)),''),p_is_active);
  end if;
end; $$;
revoke all on function public.admin_save_discount(uuid,text,uuid,text,numeric,integer,timestamptz,text,boolean) from public;
grant execute on function public.admin_save_discount(uuid,text,uuid,text,numeric,integer,timestamptz,text,boolean) to authenticated;

create function public.admin_release_discount(p_reservation_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare r public.reservations%rowtype; discount_id_value uuid;
begin
  if not public.is_admin() then raise exception 'administrator_access_required' using errcode='42501'; end if;
  select * into r from public.reservations where id=p_reservation_id for update;
  if not found or r.reservation_status <> 'cancelada' then raise exception 'discount_release_requires_cancellation'; end if;
  select discount_id into discount_id_value from public.discount_redemptions where reservation_id=r.id;
  perform 1 from public.discount_codes where id=discount_id_value for update;
  update public.discount_redemptions set released_at=now(),released_by=auth.uid()
    where reservation_id=r.id and released_at is null;
end; $$;
revoke all on function public.admin_release_discount(uuid) from public;
grant execute on function public.admin_release_discount(uuid) to authenticated;

create function public.prevent_released_discount_reactivation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.reservation_status <> 'cancelada' and exists(select 1 from public.discount_redemptions
    where reservation_id=new.id and released_at is not null) then raise exception 'discount_released_reservation'; end if;
  return new;
end; $$;
revoke all on function public.prevent_released_discount_reactivation() from public;
create trigger reservations_check_released_discount before update of reservation_status on public.reservations
  for each row execute function public.prevent_released_discount_reactivation();

create or replace function public.admin_update_reservation(
  p_reservation_id uuid,
  p_reservation_status text,
  p_payment_status text,
  p_admin_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  reservation_record public.reservations%rowtype;
  tour_capacity integer;
  occupied_spots integer;
begin
  if not (select public.is_admin()) then
    raise exception 'administrator_access_required'
      using errcode = '42501';
  end if;

  if p_reservation_status not in (
    'pendiente_verificacion',
    'confirmada',
    'lista_espera',
    'cancelada',
    'completada'
  ) then
    raise exception 'invalid_reservation_status';
  end if;

  if p_payment_status not in (
    'sin_pago',
    'abono',
    'pagado',
    'reembolso_parcial',
    'reembolsado'
  ) then
    raise exception 'invalid_payment_status';
  end if;

  select *
  into reservation_record
  from public.reservations
  where id = p_reservation_id
  for update;

  if not found then
    raise exception 'reservation_not_found';
  end if;

  if p_reservation_status in ('confirmada', 'completada') then
    if not (reservation_record.total_amount = 0 and reservation_record.discount_amount > 0 and reservation_record.discount_code is not null) and p_payment_status not in ('abono', 'pagado') then
      raise exception 'confirmation_requires_payment';
    end if;

    select capacity
    into tour_capacity
    from public.tours
    where id = reservation_record.tour_id
    for update;

    select coalesce(sum(participant_count), 0)::integer
    into occupied_spots
    from public.reservations
    where tour_id = reservation_record.tour_id
      and id <> p_reservation_id
      and reservation_status in ('confirmada', 'completada');

    if occupied_spots + reservation_record.participant_count > tour_capacity then
      raise exception 'insufficient_spots';
    end if;
  end if;

  update public.reservations
  set
    reservation_status = p_reservation_status,
    payment_status = p_payment_status,
    admin_notes = case when reservation_record.total_amount = 0 and reservation_record.discount_amount > 0 and p_reservation_status = 'confirmada' and reservation_record.reservation_status <> 'confirmada' then concat_ws(E'\n', nullif(trim(p_admin_notes), ''), 'Premio gratuito confirmado por ' || auth.uid()::text || ' — ' || now()::text) else nullif(trim(p_admin_notes), '') end
  where id = p_reservation_id;
end;
$$;

revoke all on function public.admin_update_reservation(uuid, text, text, text)
from public;
grant execute on function public.admin_update_reservation(uuid, text, text, text)
to authenticated;

create or replace function public.get_public_reservation_status(
  p_reservation_code text
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'code', reservation.reservation_code,
    'tourTitle', tour.title,
    'tourSlug', tour.slug,
    'tourDate', to_char(
      tour.departure_at at time zone 'America/Santo_Domingo',
      'YYYY-MM-DD'
    ),
    'participantCount', reservation.participant_count,
    'totalAmount', reservation.total_amount,
    'originalAmount', reservation.original_amount,
    'discountAmount', reservation.discount_amount,
    'requiredDeposit', reservation.required_deposit,
    'reservationStatus', reservation.reservation_status,
    'paymentStatus', reservation.payment_status,
    'createdAt', reservation.created_at
  )
  from public.reservations as reservation
  join public.tours as tour
    on tour.id = reservation.tour_id
  where reservation.reservation_code = upper(trim(p_reservation_code))
    and upper(trim(p_reservation_code)) ~ '^RUT-[0-9]{4}-[A-F0-9]{8}$'
  limit 1;
$$;

revoke all on function public.get_public_reservation_status(text) from public;
grant execute on function public.get_public_reservation_status(text)
to anon, authenticated;


commit;
