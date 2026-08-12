-- Ruticas RD
-- Public promotional images for tours.
-- Payment receipts and private documents must use a separate private bucket.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'tour-images',
  'tour-images',
  true,
  8388608,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

with ranked_covers as (
  select
    id,
    row_number() over (
      partition by tour_id
      order by position, created_at, id
    ) as cover_number
  from public.tour_images
  where is_cover = true
)
update public.tour_images as image
set is_cover = false
from ranked_covers
where image.id = ranked_covers.id
  and ranked_covers.cover_number > 1;

create unique index if not exists tour_images_one_cover_per_tour_idx
on public.tour_images (tour_id)
where is_cover = true;

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

  -- Clear the current cover first. A single CASE-style update can violate the
  -- partial unique index depending on the row update order.
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

drop policy if exists "Admins can upload tour image files" on storage.objects;
create policy "Admins can upload tour image files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'tour-images'
  and (select public.is_admin())
);

drop policy if exists "Admins can update tour image files" on storage.objects;
create policy "Admins can update tour image files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'tour-images'
  and (select public.is_admin())
)
with check (
  bucket_id = 'tour-images'
  and (select public.is_admin())
);

drop policy if exists "Admins can delete tour image files" on storage.objects;
create policy "Admins can delete tour image files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'tour-images'
  and (select public.is_admin())
);
