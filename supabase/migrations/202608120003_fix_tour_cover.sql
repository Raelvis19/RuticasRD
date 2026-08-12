-- Ruticas RD
-- Fix changing a tour cover when another cover already exists.
-- Safe to run after 202608120002_tour_images_storage.sql.

create or replace function public.set_tour_cover(
  p_tour_id uuid,
  p_image_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'Administrator access required'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.tour_images
    where id = p_image_id
      and tour_id = p_tour_id
  ) then
    raise exception 'Tour image not found'
      using errcode = '22023';
  end if;

  update public.tour_images
  set is_cover = false
  where tour_id = p_tour_id
    and is_cover = true;

  update public.tour_images
  set is_cover = true
  where id = p_image_id
    and tour_id = p_tour_id;
end;
$$;

revoke all on function public.set_tour_cover(uuid, uuid) from public;
grant execute on function public.set_tour_cover(uuid, uuid) to authenticated;
