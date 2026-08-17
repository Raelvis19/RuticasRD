-- Galería organizada por colecciones o destinos.
-- Conserva las imágenes existentes y las agrupa usando su ubicación actual.

create table if not exists public.gallery_collections (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 100),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text
    check (description is null or char_length(trim(description)) <= 500),
  position integer not null default 0 check (position >= 0),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists gallery_collections_name_unique
on public.gallery_collections (lower(trim(name)));

create index if not exists gallery_collections_public_order_idx
on public.gallery_collections (published, position, created_at);

drop trigger if exists gallery_collections_set_updated_at
on public.gallery_collections;
create trigger gallery_collections_set_updated_at
before update on public.gallery_collections
for each row execute function public.set_updated_at();

alter table public.gallery_collections enable row level security;

drop policy if exists "Public can read published gallery collections"
on public.gallery_collections;
create policy "Public can read published gallery collections"
on public.gallery_collections for select to anon, authenticated
using (published = true);

drop policy if exists "Admins can read all gallery collections"
on public.gallery_collections;
create policy "Admins can read all gallery collections"
on public.gallery_collections for select to authenticated
using ((select public.is_admin()));

drop policy if exists "Admins can insert gallery collections"
on public.gallery_collections;
create policy "Admins can insert gallery collections"
on public.gallery_collections for insert to authenticated
with check ((select public.is_admin()));

drop policy if exists "Admins can update gallery collections"
on public.gallery_collections;
create policy "Admins can update gallery collections"
on public.gallery_collections for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can delete gallery collections"
on public.gallery_collections;
create policy "Admins can delete gallery collections"
on public.gallery_collections for delete to authenticated
using ((select public.is_admin()));

alter table public.gallery_images
add column if not exists collection_id uuid;

-- Crea una colección por cada ubicación ya utilizada. Los acentos se
-- normalizan para producir URLs legibles como /galeria/rio-partido.
with locations as (
  select
    min(trim(location)) as name,
    min(position) as position
  from public.gallery_images
  where nullif(trim(location), '') is not null
  group by lower(trim(location))
), normalized as (
  select
    name,
    position,
    btrim(
      regexp_replace(
        translate(
          lower(name),
          'áéíóúüñÁÉÍÓÚÜÑ',
          'aeiouunAEIOUUN'
        ),
        '[^a-z0-9]+',
        '-',
        'g'
      ),
      '-'
    ) as base_slug
  from locations
), unique_slugs as (
  select
    name,
    position,
    case
      when base_slug = '' then 'destino-' || substr(md5(name), 1, 8)
      when count(*) over (partition by base_slug) > 1
        then base_slug || '-' || substr(md5(name), 1, 6)
      else base_slug
    end as slug
  from normalized
)
insert into public.gallery_collections (name, slug, position)
select name, slug, position
from unique_slugs
on conflict do nothing;

update public.gallery_images as image
set collection_id = collection.id
from public.gallery_collections as collection
where image.collection_id is null
  and nullif(trim(image.location), '') is not null
  and lower(trim(image.location)) = lower(trim(collection.name));

insert into public.gallery_collections (name, slug, position)
select
  'Otros destinos',
  'otros-destinos',
  coalesce((select max(position) + 1 from public.gallery_collections), 0)
where exists (
  select 1 from public.gallery_images where collection_id is null
)
on conflict do nothing;

update public.gallery_images as image
set collection_id = collection.id,
    location = coalesce(nullif(trim(image.location), ''), collection.name)
from public.gallery_collections as collection
where image.collection_id is null
  and collection.slug = 'otros-destinos';

alter table public.gallery_images
drop constraint if exists gallery_images_collection_id_fkey;

alter table public.gallery_images
add constraint gallery_images_collection_id_fkey
foreign key (collection_id)
references public.gallery_collections(id)
on delete restrict;

alter table public.gallery_images
alter column collection_id set not null;

create index if not exists gallery_images_collection_order_idx
on public.gallery_images (collection_id, position, created_at);

drop policy if exists "Public can read gallery images"
on public.gallery_images;
drop policy if exists "Public can read gallery images from published collections"
on public.gallery_images;
create policy "Public can read gallery images from published collections"
on public.gallery_images for select to anon, authenticated
using (
  exists (
    select 1
    from public.gallery_collections
    where gallery_collections.id = gallery_images.collection_id
      and gallery_collections.published = true
  )
);

drop policy if exists "Admins can read all gallery images"
on public.gallery_images;
create policy "Admins can read all gallery images"
on public.gallery_images for select to authenticated
using ((select public.is_admin()));
