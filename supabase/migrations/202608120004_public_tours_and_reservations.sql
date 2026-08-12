-- Ruticas RD
-- Safe public availability and reservation entry points.
-- Personal reservation data remains protected by RLS.

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

create or replace function public.create_public_reservation(
  p_tour_id uuid,
  p_customer jsonb,
  p_participants jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  tour_record public.tours%rowtype;
  reservation_id_value uuid;
  reservation_code_value text;
  participant jsonb;
  participant_total integer;
  occupied_spots integer;
  customer_name_value text;
  customer_document_value text;
  customer_phone_value text;
  customer_email_value text;
  customer_city_value text;
  participant_name_value text;
  participant_document_value text;
  participant_city_value text;
  emergency_name_value text;
  emergency_phone_value text;
  guardian_name_value text;
  is_minor_value boolean;
begin
  if p_customer is null or jsonb_typeof(p_customer) <> 'object' then
    raise exception 'invalid_customer';
  end if;

  if p_participants is null or jsonb_typeof(p_participants) <> 'array' then
    raise exception 'invalid_participants';
  end if;

  participant_total := jsonb_array_length(p_participants);
  if participant_total < 1 or participant_total > 50 then
    raise exception 'invalid_participant_count';
  end if;

  select *
  into tour_record
  from public.tours
  where id = p_tour_id
  for update;

  if not found or tour_record.status not in ('publicado', 'cupos_agotados') then
    raise exception 'tour_not_available';
  end if;

  if tour_record.status = 'cupos_agotados' then
    raise exception 'tour_sold_out';
  end if;

  if tour_record.reservation_deadline < now() then
    raise exception 'reservation_deadline_passed';
  end if;

  select coalesce(sum(reservation.participant_count), 0)::integer
  into occupied_spots
  from public.reservations as reservation
  where reservation.tour_id = p_tour_id
    and reservation.reservation_status in (
      'confirmada',
      'completada'
    );

  if occupied_spots + participant_total > tour_record.capacity then
    raise exception 'insufficient_spots';
  end if;

  customer_name_value := nullif(trim(p_customer ->> 'fullName'), '');
  customer_document_value := nullif(trim(p_customer ->> 'documentNumber'), '');
  customer_phone_value := nullif(trim(p_customer ->> 'phone'), '');
  customer_email_value := nullif(trim(p_customer ->> 'email'), '');
  customer_city_value := nullif(trim(p_customer ->> 'city'), '');

  if customer_name_value is null
    or customer_document_value is null
    or customer_phone_value is null
    or customer_city_value is null then
    raise exception 'incomplete_customer';
  end if;

  if length(customer_name_value) > 180
    or length(customer_document_value) > 80
    or length(customer_phone_value) > 40
    or length(customer_city_value) > 120
    or coalesce(length(customer_email_value), 0) > 180 then
    raise exception 'customer_data_too_long';
  end if;

  if exists (
    select 1
    from public.reservations as recent_reservation
    where recent_reservation.tour_id = p_tour_id
      and recent_reservation.customer_phone = customer_phone_value
      and recent_reservation.created_at > now() - interval '2 minutes'
      and recent_reservation.reservation_status = 'pendiente_verificacion'
  ) then
    raise exception 'duplicate_recent_reservation';
  end if;

  reservation_code_value :=
    'RUT-' || to_char(now(), 'YYYY') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.reservations (
    reservation_code,
    tour_id,
    customer_name,
    customer_document_type,
    customer_document_number,
    customer_phone,
    customer_email,
    customer_city,
    participant_count,
    price_per_person,
    deposit_per_person,
    total_amount,
    required_deposit,
    reservation_status,
    payment_status
  )
  values (
    reservation_code_value,
    p_tour_id,
    customer_name_value,
    'cedula',
    customer_document_value,
    customer_phone_value,
    customer_email_value,
    customer_city_value,
    participant_total,
    tour_record.price,
    tour_record.deposit_amount,
    tour_record.price * participant_total,
    tour_record.deposit_amount * participant_total,
    'pendiente_verificacion',
    'sin_pago'
  )
  returning id into reservation_id_value;

  for participant in
    select item.value
    from jsonb_array_elements(p_participants) as item(value)
  loop
    participant_name_value := nullif(trim(participant ->> 'fullName'), '');
    participant_document_value := nullif(trim(participant ->> 'documentNumber'), '');
    participant_city_value := nullif(trim(participant ->> 'city'), '');
    emergency_name_value := nullif(trim(participant ->> 'emergencyName'), '');
    emergency_phone_value := nullif(trim(participant ->> 'emergencyPhone'), '');
    guardian_name_value := nullif(trim(participant ->> 'guardianName'), '');
    is_minor_value := coalesce((participant ->> 'isMinor')::boolean, false);

    if participant_name_value is null
      or participant_document_value is null
      or participant_city_value is null
      or emergency_name_value is null
      or emergency_phone_value is null then
      raise exception 'incomplete_participant';
    end if;

    if is_minor_value and guardian_name_value is null then
      raise exception 'minor_requires_guardian';
    end if;

    if length(participant_name_value) > 180
      or length(participant_document_value) > 80
      or length(participant_city_value) > 120
      or length(emergency_name_value) > 180
      or length(emergency_phone_value) > 40
      or coalesce(length(guardian_name_value), 0) > 180 then
      raise exception 'participant_data_too_long';
    end if;

    insert into public.reservation_participants (
      reservation_id,
      full_name,
      document_type,
      document_number,
      city,
      is_minor,
      guardian_name,
      emergency_contact_name,
      emergency_contact_phone
    )
    values (
      reservation_id_value,
      participant_name_value,
      'cedula',
      participant_document_value,
      participant_city_value,
      is_minor_value,
      guardian_name_value,
      emergency_name_value,
      emergency_phone_value
    );
  end loop;

  return reservation_code_value;
end;
$$;

revoke all on function public.create_public_reservation(uuid, jsonb, jsonb)
from public;
grant execute on function public.create_public_reservation(uuid, jsonb, jsonb)
to anon, authenticated;
