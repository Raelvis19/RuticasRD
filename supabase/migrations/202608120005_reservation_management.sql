-- Ruticas RD
-- Reservation management, public status lookup and paid-capacity workflow.
-- Run after 202608120004_public_tours_and_reservations.sql.

-- Only confirmed/paid reservations consume public capacity. Pending requests
-- remain visible to admins but do not block spots before payment verification.
create or replace function public.get_public_tour_availability()
returns table (
  tour_id uuid,
  available_spots integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    tour.id as tour_id,
    greatest(
      tour.capacity - coalesce(
        sum(reservation.participant_count) filter (
          where reservation.reservation_status in (
            'confirmada',
            'completada'
          )
        ),
        0
      ),
      0
    )::integer as available_spots
  from public.tours as tour
  left join public.reservations as reservation
    on reservation.tour_id = tour.id
  where tour.status in ('publicado', 'cupos_agotados')
  group by tour.id, tour.capacity;
$$;

revoke all on function public.get_public_tour_availability() from public;
grant execute on function public.get_public_tour_availability()
to anon, authenticated;

-- Code-only lookup returns a deliberately limited summary. Documents,
-- participant names, phones and emergency contacts are never exposed.
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

-- Atomically verifies payment/reservation status and prevents overbooking.
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
    if p_payment_status not in ('abono', 'pagado') then
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
    admin_notes = nullif(trim(p_admin_notes), '')
  where id = p_reservation_id;
end;
$$;

revoke all on function public.admin_update_reservation(uuid, text, text, text)
from public;
grant execute on function public.admin_update_reservation(uuid, text, text, text)
to authenticated;
