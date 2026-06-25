-- =============================================================================
-- Migration 0001 — Role-Based Access Control (3-tier)
-- Run AFTER schema.sql:  Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Idempotent: safe to re-run.
--
-- Roles:
--   admin   — everything, incl. managing users and site settings
--   editor  — content CRUD (products, categories, images, inquiries, content)
--   viewer  — read-only admin dashboard; NO privileged writes
-- =============================================================================

-- ---------- 1. Widen the role check to three tiers ---------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('viewer','editor','admin'));

-- ---------- 2. is_staff(): editor OR admin (content writers) -----------------
-- SECURITY DEFINER so RLS policies can call it without recursive RLS checks.
create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('editor','admin')
  );
$$;

-- is_admin() already exists from schema.sql and stays admin-only (users/settings).

-- ---------- 3. Repoint CONTENT write policies to staff -----------------------
-- Categories
drop policy if exists cat_write on public.categories;
create policy cat_write on public.categories for all
  using (public.is_staff()) with check (public.is_staff());

-- Products
drop policy if exists prod_write on public.products;
create policy prod_write on public.products for all
  using (public.is_staff()) with check (public.is_staff());
-- Admins/editors read all (incl. unpublished); public reads published.
drop policy if exists prod_read on public.products;
create policy prod_read on public.products for select
  using (is_published = true or public.is_staff());

-- Product images
drop policy if exists img_write on public.product_images;
create policy img_write on public.product_images for all
  using (public.is_staff()) with check (public.is_staff());

-- Site settings: staff may edit content; reads stay public.
drop policy if exists set_write on public.site_settings;
create policy set_write on public.site_settings for all
  using (public.is_staff()) with check (public.is_staff());

-- ---------- 4. Inquiries: public insert, staff read/manage, admin delete -----
drop policy if exists inq_read on public.inquiries;
drop policy if exists inq_update on public.inquiries;
drop policy if exists inq_delete on public.inquiries;
create policy inq_read   on public.inquiries for select using (public.is_staff());
create policy inq_update on public.inquiries for update
  using (public.is_staff()) with check (public.is_staff());
create policy inq_delete on public.inquiries for delete using (public.is_admin());

-- ---------- 5. Profiles: self-read, ADMIN-ONLY writes (role changes) ---------
-- Already admin-only from schema.sql (profiles_admin_all). Re-assert for clarity.
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- 6. Storage: staff may write product images ----------------------
drop policy if exists "product images admin write"  on storage.objects;
drop policy if exists "product images admin update" on storage.objects;
drop policy if exists "product images admin delete" on storage.objects;
drop policy if exists "product images staff write"  on storage.objects;
drop policy if exists "product images staff update" on storage.objects;
drop policy if exists "product images staff delete" on storage.objects;
create policy "product images staff write" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_staff());
create policy "product images staff update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_staff());
create policy "product images staff delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_staff());

-- =============================================================================
-- Set a user's role (run as needed):
--   update public.profiles set role = 'admin'  where email = 'you@example.com';
--   update public.profiles set role = 'editor' where email = 'staff@example.com';
--   update public.profiles set role = 'viewer' where email = 'guest@example.com';
-- New sign-ups default to 'viewer' (see handle_new_user in schema.sql).
-- =============================================================================
