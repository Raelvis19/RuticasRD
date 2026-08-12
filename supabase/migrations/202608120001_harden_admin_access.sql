-- Ruticas RD
-- Harden administrative access on the existing schema.
-- Safe to run after the initial schema: it does not recreate tables or delete data.

-- An administrator must have the explicit admin role.
-- Staff permissions can be added later per operation without allowing role escalation.
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
      and role = 'admin'
      and is_active = true
  );
$$;

-- Do not expose the security-definer helper to anonymous users.
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- The public policy only exposes published/sold-out tours. Administrators need
-- a separate policy to see drafts, cancelled tours and completed tours.
drop policy if exists "Admins can read all tours" on public.tours;
create policy "Admins can read all tours"
on public.tours
for select
to authenticated
using ((select public.is_admin()));

-- The public image policy only exposes images belonging to visible tours.
drop policy if exists "Admins can read all tour images" on public.tour_images;
create policy "Admins can read all tour images"
on public.tour_images
for select
to authenticated
using ((select public.is_admin()));

