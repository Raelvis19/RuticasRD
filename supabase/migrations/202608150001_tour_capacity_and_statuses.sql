-- ETAPA 1: estados operativos y capacidad segura de tours.
-- "agotado" se deriva cuando un tour publicado llega a cero cupos; no se
-- persiste para evitar confundir capacidad con el ciclo de vida del tour.

update public.tours
set status = case
  when status = 'cupos_agotados' then 'publicado'
  when status = 'completado' then 'finalizado'
  else status
end
where status in ('cupos_agotados', 'completado');

alter table public.tours
drop constraint if exists tours_status_check;

alter table public.tours
add constraint tours_status_check
check (status in ('borrador', 'publicado', 'finalizado', 'cancelado', 'pospuesto'));

create or replace function public.get_public_tour_availability()
returns table (tour_id uuid, available_spots integer)
language sql
stable
security definer
set search_path = ''
as $$
  select
    tour.id,
    greatest(
      tour.capacity - coalesce(
        sum(reservation.participant_count) filter (
          where reservation.reservation_status in (
            'confirmada', 'completada'
          )
        ),
        0
      ),
      0
    )::integer
  from public.tours as tour
  left join public.reservations as reservation on reservation.tour_id = tour.id
  where tour.status = 'publicado'
  group by tour.id, tour.capacity;
$$;

revoke all on function public.get_public_tour_availability() from public;
grant execute on function public.get_public_tour_availability() to anon, authenticated;

create or replace function public.enforce_tour_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  tour_capacity integer;
  occupied integer;
begin
  if new.reservation_status not in ('confirmada', 'completada') then
    return new;
  end if;

  select capacity into tour_capacity
  from public.tours
  where id = new.tour_id
  for update;

  select coalesce(sum(participant_count), 0)::integer into occupied
  from public.reservations
  where tour_id = new.tour_id
    and reservation_status in ('confirmada', 'completada')
    and (tg_op = 'INSERT' or id <> new.id);

  if occupied + new.participant_count > tour_capacity then
    raise exception 'insufficient_spots';
  end if;

  return new;
end;
$$;

drop trigger if exists reservations_enforce_tour_capacity on public.reservations;
create trigger reservations_enforce_tour_capacity
before insert or update of tour_id, participant_count, reservation_status
on public.reservations
for each row execute function public.enforce_tour_capacity();

create or replace function public.prevent_capacity_below_occupancy()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  occupied integer;
begin
  select coalesce(sum(participant_count), 0)::integer into occupied
  from public.reservations
  where tour_id = new.id
    and reservation_status in ('confirmada', 'completada');

  if new.capacity < occupied then
    raise exception 'capacity_below_occupied_spots';
  end if;
  return new;
end;
$$;

drop trigger if exists tours_prevent_capacity_below_occupancy on public.tours;
create trigger tours_prevent_capacity_below_occupancy
before update of capacity on public.tours
for each row execute function public.prevent_capacity_below_occupancy();
