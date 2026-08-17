-- Ruticas RD: administrable public gallery.

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  storage_path text unique,
  alt_text text not null check (char_length(trim(alt_text)) between 3 and 180),
  location text check (location is null or char_length(location) <= 100),
  category text not null default 'aventura'
    check (category in ('naturaleza', 'grupo', 'aventura', 'destino', 'organizacion')),
  orientation text not null default 'horizontal'
    check (orientation in ('horizontal', 'vertical', 'cuadrada')),
  featured boolean not null default false,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_images_position_idx
on public.gallery_images(position, created_at);

drop trigger if exists gallery_images_set_updated_at on public.gallery_images;
create trigger gallery_images_set_updated_at
before update on public.gallery_images
for each row execute function public.set_updated_at();

alter table public.gallery_images enable row level security;

drop policy if exists "Public can read gallery images" on public.gallery_images;
create policy "Public can read gallery images"
on public.gallery_images for select to anon, authenticated using (true);

drop policy if exists "Admins can insert gallery images" on public.gallery_images;
create policy "Admins can insert gallery images"
on public.gallery_images for insert to authenticated
with check ((select public.is_admin()));

drop policy if exists "Admins can update gallery images" on public.gallery_images;
create policy "Admins can update gallery images"
on public.gallery_images for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Admins can delete gallery images" on public.gallery_images;
create policy "Admins can delete gallery images"
on public.gallery_images for delete to authenticated
using ((select public.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery-images', 'gallery-images', true, 8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can upload gallery files" on storage.objects;
create policy "Admins can upload gallery files"
on storage.objects for insert to authenticated
with check (bucket_id = 'gallery-images' and (select public.is_admin()));

drop policy if exists "Admins can update gallery files" on storage.objects;
create policy "Admins can update gallery files"
on storage.objects for update to authenticated
using (bucket_id = 'gallery-images' and (select public.is_admin()))
with check (bucket_id = 'gallery-images' and (select public.is_admin()));

drop policy if exists "Admins can delete gallery files" on storage.objects;
create policy "Admins can delete gallery files"
on storage.objects for delete to authenticated
using (bucket_id = 'gallery-images' and (select public.is_admin()));

-- Preserve the gallery that currently ships from /public as editable metadata.
insert into public.gallery_images
  (source_url, alt_text, location, category, orientation, featured, position)
values
  ('/images/gallery/experiencia-constanza-01.webp', 'Paisaje natural visitado durante una excursión de Ruticas RD en Constanza', 'Constanza', 'naturaleza', 'vertical', true, 0),
  ('/images/gallery/experiencia-constanza-02.webp', 'Experiencia realizada por Ruticas RD en Constanza', 'Constanza', 'aventura', 'vertical', true, 1),
  ('/images/gallery/experiencia-constanza-03.webp', 'Recorrido natural organizado por Ruticas RD en Constanza', 'Constanza', 'naturaleza', 'vertical', false, 2),
  ('/images/gallery/experiencia-grupal-01.webp', 'Participantes compartiendo durante una excursión de Ruticas RD', 'Constanza', 'grupo', 'horizontal', true, 3),
  ('/images/gallery/experiencia-grupal-02.webp', 'Grupo de participantes disfrutando una experiencia de Ruticas RD', 'Constanza', 'grupo', 'horizontal', false, 4),
  ('/images/gallery/paisaje-01.webp', 'Paisaje natural de República Dominicana visitado por Ruticas RD', null, 'destino', 'horizontal', false, 5),
  ('/images/gallery/paisaje-02.webp', 'Vista panorámica de un destino natural de República Dominicana', null, 'destino', 'horizontal', false, 6)
on conflict do nothing;
