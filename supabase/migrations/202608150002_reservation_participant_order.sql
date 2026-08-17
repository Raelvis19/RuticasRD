-- ETAPA 2: conserva el orden de los participantes dentro de cada reserva.

alter table public.reservation_participants
add column if not exists participant_number integer;

with numbered as (
  select
    id,
    row_number() over (
      partition by reservation_id
      order by created_at, id
    )::integer as position
  from public.reservation_participants
)
update public.reservation_participants as participant
set participant_number = numbered.position
from numbered
where numbered.id = participant.id
  and participant.participant_number is null;

create or replace function public.assign_reservation_participant_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.participant_number is null then
    select coalesce(max(participant_number), 0) + 1
    into new.participant_number
    from public.reservation_participants
    where reservation_id = new.reservation_id;
  end if;
  return new;
end;
$$;

drop trigger if exists reservation_participants_assign_number
on public.reservation_participants;

create trigger reservation_participants_assign_number
before insert on public.reservation_participants
for each row execute function public.assign_reservation_participant_number();

alter table public.reservation_participants
alter column participant_number set not null;

alter table public.reservation_participants
drop constraint if exists reservation_participants_number_positive;

alter table public.reservation_participants
add constraint reservation_participants_number_positive
check (participant_number > 0);

create unique index if not exists reservation_participants_number_unique
on public.reservation_participants(reservation_id, participant_number);
