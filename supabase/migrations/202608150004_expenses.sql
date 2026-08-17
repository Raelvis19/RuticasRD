-- ETAPA 4: gastos estimados y reales por excursión.

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete restrict,
  concept text not null check (length(trim(concept)) between 3 and 180),
  category text not null check (category in ('transporte','entradas','guias','desayuno','almuerzo','refrigerio','permisos','alojamiento','camping','reservaciones','utensilios','publicidad','comisiones','otros')),
  calculation_type text not null default 'total' check (calculation_type in ('total','por_participante')),
  quantity integer not null default 1 check (quantity > 0),
  estimated_unit_amount numeric(12,2) not null default 0 check (estimated_unit_amount >= 0),
  actual_unit_amount numeric(12,2) check (actual_unit_amount is null or actual_unit_amount >= 0),
  estimated_amount numeric(12,2) not null default 0 check (estimated_amount >= 0),
  actual_amount numeric(12,2) check (actual_amount is null or actual_amount >= 0),
  recipient text not null,
  payment_method text check (payment_method is null or payment_method in ('transferencia','efectivo','otro')),
  reference text,
  receipt_path text,
  expense_date date,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_tour_id_idx on public.expenses(tour_id);
create index if not exists expenses_category_idx on public.expenses(category);
create trigger expenses_set_updated_at before update on public.expenses
for each row execute function public.set_updated_at();

alter table public.expenses enable row level security;
create policy "Admins can read expenses" on public.expenses for select to authenticated using ((select public.is_admin()));
create policy "Admins can insert expenses" on public.expenses for insert to authenticated with check ((select public.is_admin()));
create policy "Admins can update expenses" on public.expenses for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete expenses" on public.expenses for delete to authenticated using ((select public.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('expense-receipts','expense-receipts',false,8388608,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

create policy "Admins can read expense receipts" on storage.objects for select to authenticated using (bucket_id='expense-receipts' and (select public.is_admin()));
create policy "Admins can upload expense receipts" on storage.objects for insert to authenticated with check (bucket_id='expense-receipts' and (select public.is_admin()));
create policy "Admins can delete expense receipts" on storage.objects for delete to authenticated using (bucket_id='expense-receipts' and (select public.is_admin()));
