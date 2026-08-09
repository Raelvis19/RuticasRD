-- ============================================================
-- RUTICAS RD
-- Initial database schema
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- UTILITY FUNCTION: updated_at
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- 1. PROFILES
-- Usuarios administrativos vinculados con Supabase Auth
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text not null,

  role text not null default 'staff'
    check (role in ('admin', 'staff')),

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();


-- ============================================================
-- ADMIN HELPER
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role in ('admin', 'staff')
      and is_active = true
  );
$$;


-- ============================================================
-- 2. TOURS
-- ============================================================

create table public.tours (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique,

  title text not null,

  short_description text not null,
  description text not null,

  category text not null
    check (
      category in (
        'senderismo',
        'balneario',
        'cascada',
        'montana',
        'parque_nacional',
        'playa',
        'ecologico',
        'turistico'
      )
    ),

  difficulty text not null
    check (
      difficulty in (
        'facil',
        'moderada',
        'demandante'
      )
    ),

  location text not null,
  province text not null,
  meeting_point text not null,

  departure_at timestamptz not null,
  estimated_return_at timestamptz,

  duration text,

  price numeric(12, 2) not null
    check (price >= 0),

  deposit_amount numeric(12, 2) not null default 0
    check (deposit_amount >= 0),

  reservation_deadline timestamptz not null,

  capacity integer not null
    check (capacity > 0),

  minimum_age integer
    check (minimum_age is null or minimum_age >= 0),

  minors_allowed boolean not null default false,

  transport_included boolean not null default true,
  local_guide_included boolean not null default false,

  includes text[] not null default '{}',
  not_includes text[] not null default '{}',

  requirements text[] not null default '{}',
  recommendations text[] not null default '{}',
  inherent_risks text[] not null default '{}',

  punctuality_policy text,
  cancellation_policy text,

  itinerary jsonb not null default '[]'::jsonb,

  status text not null default 'borrador'
    check (
      status in (
        'borrador',
        'publicado',
        'cupos_agotados',
        'cancelado',
        'completado'
      )
    ),

  featured boolean not null default false,

  created_by uuid references public.profiles(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tours_deposit_not_greater_than_price
    check (deposit_amount <= price)
);


create index tours_status_idx
on public.tours(status);

create index tours_departure_at_idx
on public.tours(departure_at);

create index tours_featured_idx
on public.tours(featured);

create index tours_category_idx
on public.tours(category);


create trigger tours_set_updated_at
before update on public.tours
for each row
execute function public.set_updated_at();


-- ============================================================
-- 3. TOUR IMAGES
-- Solo metadata.
-- Las imágenes reales estarán en Supabase Storage.
-- ============================================================

create table public.tour_images (
  id uuid primary key default gen_random_uuid(),

  tour_id uuid not null
    references public.tours(id)
    on delete cascade,

  storage_path text not null,

  alt_text text,

  position integer not null default 0
    check (position >= 0),

  is_cover boolean not null default false,

  created_at timestamptz not null default now(),

  unique (tour_id, storage_path)
);


create index tour_images_tour_id_idx
on public.tour_images(tour_id);


-- ============================================================
-- 4. RESERVATIONS
-- ============================================================

create table public.reservations (
  id uuid primary key default gen_random_uuid(),

  reservation_code text not null unique,

  tour_id uuid not null
    references public.tours(id)
    on delete restrict,

  -- Responsable de la reservación

  customer_name text not null,

  customer_document_type text not null default 'cedula'
    check (
      customer_document_type in (
        'cedula',
        'pasaporte',
        'otro'
      )
    ),

  customer_document_number text not null,

  customer_phone text not null,
  customer_email text,
  customer_city text not null,

  participant_count integer not null
    check (participant_count > 0),

  customer_notes text,
  admin_notes text,

  -- Snapshot de precios
  -- Si el precio del tour cambia mañana,
  -- una reservación anterior conserva su precio original.

  price_per_person numeric(12, 2) not null
    check (price_per_person >= 0),

  deposit_per_person numeric(12, 2) not null
    check (deposit_per_person >= 0),

  total_amount numeric(12, 2) not null
    check (total_amount >= 0),

  required_deposit numeric(12, 2) not null
    check (required_deposit >= 0),

  reservation_status text not null
    default 'pendiente_verificacion'
    check (
      reservation_status in (
        'pendiente_verificacion',
        'confirmada',
        'lista_espera',
        'cancelada',
        'completada'
      )
    ),

  payment_status text not null
    default 'sin_pago'
    check (
      payment_status in (
        'sin_pago',
        'abono',
        'pagado',
        'reembolso_parcial',
        'reembolsado'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint reservation_amounts_valid
    check (
      required_deposit <= total_amount
    )
);


create index reservations_tour_id_idx
on public.reservations(tour_id);

create index reservations_code_idx
on public.reservations(reservation_code);

create index reservations_status_idx
on public.reservations(reservation_status);

create index reservations_created_at_idx
on public.reservations(created_at desc);


create trigger reservations_set_updated_at
before update on public.reservations
for each row
execute function public.set_updated_at();


-- ============================================================
-- 5. RESERVATION PARTICIPANTS
-- ============================================================

create table public.reservation_participants (
  id uuid primary key default gen_random_uuid(),

  reservation_id uuid not null
    references public.reservations(id)
    on delete cascade,

  full_name text not null,

  document_type text not null default 'cedula'
    check (
      document_type in (
        'cedula',
        'pasaporte',
        'otro'
      )
    ),

  document_number text not null,

  phone text,

  city text not null,

  is_minor boolean not null default false,

  guardian_name text,

  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  emergency_contact_relationship text,

  created_at timestamptz not null default now(),

  constraint minor_requires_guardian
    check (
      is_minor = false
      or (
        is_minor = true
        and guardian_name is not null
        and length(trim(guardian_name)) > 0
      )
    )
);


create index reservation_participants_reservation_id_idx
on public.reservation_participants(reservation_id);


-- ============================================================
-- 6. PAYMENTS
-- ============================================================

create table public.payments (
  id uuid primary key default gen_random_uuid(),

  reservation_id uuid not null
    references public.reservations(id)
    on delete restrict,

  amount numeric(12, 2) not null
    check (amount > 0),

  method text not null
    check (
      method in (
        'transferencia',
        'efectivo',
        'otro'
      )
    ),

  reference text,

  -- Guardaremos solamente la ruta dentro del bucket privado.
  receipt_path text,

  verification_status text not null
    default 'pendiente'
    check (
      verification_status in (
        'pendiente',
        'verificado',
        'rechazado'
      )
    ),

  paid_at timestamptz not null default now(),

  verified_at timestamptz,

  verified_by uuid
    references public.profiles(id)
    on delete set null,

  rejection_reason text,

  created_at timestamptz not null default now(),

  constraint verified_payment_requires_verifier
    check (
      verification_status <> 'verificado'
      or verified_by is not null
    )
);


create index payments_reservation_id_idx
on public.payments(reservation_id);

create index payments_verification_status_idx
on public.payments(verification_status);


-- ============================================================
-- 7. WAITLIST
-- ============================================================

create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),

  tour_id uuid not null
    references public.tours(id)
    on delete cascade,

  full_name text not null,
  phone text not null,
  email text,

  party_size integer not null default 1
    check (party_size > 0),

  status text not null default 'esperando'
    check (
      status in (
        'esperando',
        'contactado',
        'convertido',
        'cancelado'
      )
    ),

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create index waitlist_tour_id_idx
on public.waitlist_entries(tour_id);

create index waitlist_status_idx
on public.waitlist_entries(status);


create trigger waitlist_set_updated_at
before update on public.waitlist_entries
for each row
execute function public.set_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles
enable row level security;

alter table public.tours
enable row level security;

alter table public.tour_images
enable row level security;

alter table public.reservations
enable row level security;

alter table public.reservation_participants
enable row level security;

alter table public.payments
enable row level security;

alter table public.waitlist_entries
enable row level security;


-- ============================================================
-- PUBLIC TOUR ACCESS
-- ============================================================

create policy "Public can read published tours"
on public.tours
for select
to anon, authenticated
using (
  status in (
    'publicado',
    'cupos_agotados'
  )
);


create policy "Public can read images from published tours"
on public.tour_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.tours
    where tours.id = tour_images.tour_id
      and tours.status in (
        'publicado',
        'cupos_agotados'
      )
  )
);


-- ============================================================
-- ADMIN: PROFILES
-- ============================================================

create policy "Admins can read profiles"
on public.profiles
for select
to authenticated
using (
  (select public.is_admin())
);


create policy "Admins can update profiles"
on public.profiles
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


-- ============================================================
-- ADMIN: TOURS
-- ============================================================

create policy "Admins can insert tours"
on public.tours
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can update tours"
on public.tours
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete tours"
on public.tours
for delete
to authenticated
using (
  (select public.is_admin())
);


-- ============================================================
-- ADMIN: TOUR IMAGES
-- ============================================================

create policy "Admins can insert tour images"
on public.tour_images
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can update tour images"
on public.tour_images
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete tour images"
on public.tour_images
for delete
to authenticated
using (
  (select public.is_admin())
);


-- ============================================================
-- ADMIN: RESERVATIONS
-- ============================================================

create policy "Admins can read reservations"
on public.reservations
for select
to authenticated
using (
  (select public.is_admin())
);


create policy "Admins can insert reservations"
on public.reservations
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can update reservations"
on public.reservations
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete reservations"
on public.reservations
for delete
to authenticated
using (
  (select public.is_admin())
);


-- ============================================================
-- ADMIN: PARTICIPANTS
-- ============================================================

create policy "Admins can read reservation participants"
on public.reservation_participants
for select
to authenticated
using (
  (select public.is_admin())
);


create policy "Admins can insert reservation participants"
on public.reservation_participants
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can update reservation participants"
on public.reservation_participants
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete reservation participants"
on public.reservation_participants
for delete
to authenticated
using (
  (select public.is_admin())
);


-- ============================================================
-- ADMIN: PAYMENTS
-- ============================================================

create policy "Admins can read payments"
on public.payments
for select
to authenticated
using (
  (select public.is_admin())
);


create policy "Admins can insert payments"
on public.payments
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can update payments"
on public.payments
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete payments"
on public.payments
for delete
to authenticated
using (
  (select public.is_admin())
);


-- ============================================================
-- ADMIN: WAITLIST
-- ============================================================

create policy "Admins can read waitlist"
on public.waitlist_entries
for select
to authenticated
using (
  (select public.is_admin())
);


create policy "Admins can insert waitlist"
on public.waitlist_entries
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can update waitlist"
on public.waitlist_entries
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete waitlist"
on public.waitlist_entries
for delete
to authenticated
using (
  (select public.is_admin())
);