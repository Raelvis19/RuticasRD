-- Eliminación administrativa y atómica de un tour de prueba.
-- La función exige el título exacto como confirmación y elimina únicamente los
-- datos vinculados a ese tour. Las rutas de archivos se devuelven para que la
-- aplicación borre también las imágenes y comprobantes de Supabase Storage.

create or replace function public.admin_delete_tour_with_related_data(
  p_tour_id uuid,
  p_confirmation_title text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_title text;
  target_slug text;
  image_paths text[];
  payment_receipt_paths text[];
  expense_receipt_paths text[];
  reservation_total integer;
  payment_total integer;
  expense_total integer;
  image_total integer;
  waitlist_total integer;
begin
  if not (select public.is_admin()) then
    raise exception 'admin_access_required' using errcode = '42501';
  end if;

  select title, slug
  into target_title, target_slug
  from public.tours
  where id = p_tour_id
  for update;

  if not found then
    raise exception 'tour_not_found' using errcode = 'P0002';
  end if;

  if target_title <> trim(coalesce(p_confirmation_title, '')) then
    raise exception 'tour_delete_confirmation_mismatch' using errcode = '22023';
  end if;

  select
    coalesce(array_agg(storage_path) filter (where storage_path is not null), '{}'::text[]),
    count(*)::integer
  into image_paths, image_total
  from public.tour_images
  where tour_id = p_tour_id;

  select
    coalesce(array_agg(payment.receipt_path) filter (where payment.receipt_path is not null), '{}'::text[]),
    count(payment.id)::integer
  into payment_receipt_paths, payment_total
  from public.payments as payment
  inner join public.reservations as reservation
    on reservation.id = payment.reservation_id
  where reservation.tour_id = p_tour_id;

  select count(*)::integer
  into reservation_total
  from public.reservations
  where tour_id = p_tour_id;

  select
    coalesce(array_agg(receipt_path) filter (where receipt_path is not null), '{}'::text[]),
    count(*)::integer
  into expense_receipt_paths, expense_total
  from public.expenses
  where tour_id = p_tour_id;

  select count(*)::integer
  into waitlist_total
  from public.waitlist_entries
  where tour_id = p_tour_id;

  -- Los pagos deben desaparecer antes que sus reservas porque usan una llave
  -- foránea restrictiva. Participantes, lista de espera e imágenes se eliminan
  -- mediante sus relaciones en cascada al borrar la reserva o el tour.
  delete from public.payments
  where reservation_id in (
    select id
    from public.reservations
    where tour_id = p_tour_id
  );

  delete from public.expenses
  where tour_id = p_tour_id;

  delete from public.reservations
  where tour_id = p_tour_id;

  delete from public.tours
  where id = p_tour_id;

  return jsonb_build_object(
    'title', target_title,
    'slug', target_slug,
    'reservations', reservation_total,
    'payments', payment_total,
    'expenses', expense_total,
    'images', image_total,
    'waitlist_entries', waitlist_total,
    'tour_image_paths', to_jsonb(image_paths),
    'payment_receipt_paths', to_jsonb(payment_receipt_paths),
    'expense_receipt_paths', to_jsonb(expense_receipt_paths)
  );
end;
$$;

revoke all on function public.admin_delete_tour_with_related_data(uuid, text) from public;
grant execute on function public.admin_delete_tour_with_related_data(uuid, text) to authenticated;
