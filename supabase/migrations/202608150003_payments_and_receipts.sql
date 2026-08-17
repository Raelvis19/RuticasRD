-- ETAPA 3: pagos múltiples, verificación y comprobantes privados.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-receipts',
  'payment-receipts',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can read payment receipts" on storage.objects;
create policy "Admins can read payment receipts"
on storage.objects for select to authenticated
using (bucket_id = 'payment-receipts' and (select public.is_admin()));

drop policy if exists "Admins can upload payment receipts" on storage.objects;
create policy "Admins can upload payment receipts"
on storage.objects for insert to authenticated
with check (bucket_id = 'payment-receipts' and (select public.is_admin()));

drop policy if exists "Admins can delete payment receipts" on storage.objects;
create policy "Admins can delete payment receipts"
on storage.objects for delete to authenticated
using (bucket_id = 'payment-receipts' and (select public.is_admin()));

create or replace function public.validate_verified_payment_total()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  reservation_total numeric(12, 2);
  already_verified numeric(12, 2);
begin
  if new.verification_status <> 'verificado' then return new; end if;

  select total_amount into reservation_total
  from public.reservations where id = new.reservation_id for update;

  select coalesce(sum(amount), 0) into already_verified
  from public.payments
  where reservation_id = new.reservation_id
    and verification_status = 'verificado'
    and (tg_op = 'INSERT' or id <> new.id);

  if already_verified + new.amount > reservation_total then
    raise exception 'payment_exceeds_reservation_balance';
  end if;
  return new;
end;
$$;

drop trigger if exists payments_validate_verified_total on public.payments;
create trigger payments_validate_verified_total
before insert or update of amount, reservation_id, verification_status
on public.payments for each row
execute function public.validate_verified_payment_total();

create or replace function public.sync_reservation_payment_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_reservation uuid;
  total_value numeric(12, 2);
  required_deposit_value numeric(12, 2);
  verified_value numeric(12, 2);
  reservation_status_value text;
begin
  target_reservation := coalesce(new.reservation_id, old.reservation_id);
  select total_amount, required_deposit, reservation_status
  into total_value, required_deposit_value, reservation_status_value
  from public.reservations where id = target_reservation;

  select coalesce(sum(amount), 0) into verified_value
  from public.payments
  where reservation_id = target_reservation
    and verification_status = 'verificado';

  update public.reservations
  set
    payment_status = case
      when verified_value <= 0 then 'sin_pago'
      when verified_value >= total_value then 'pagado'
      else 'abono'
    end,
    reservation_status = case
      when reservation_status_value = 'pendiente_verificacion'
        and verified_value > 0
        and verified_value >= required_deposit_value then 'confirmada'
      when reservation_status_value = 'confirmada'
        and verified_value < required_deposit_value then 'pendiente_verificacion'
      else reservation_status_value
    end
  where id = target_reservation;
  return coalesce(new, old);
end;
$$;

drop trigger if exists payments_sync_reservation_status on public.payments;
create trigger payments_sync_reservation_status
after insert or update or delete on public.payments
for each row execute function public.sync_reservation_payment_status();

create index if not exists payments_paid_at_idx on public.payments(paid_at desc);
