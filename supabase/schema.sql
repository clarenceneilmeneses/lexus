-- =============================================================================
-- Lexus Industrial — Database schema (Supabase / Postgres)
-- Run once: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Security model: public reads PUBLISHED content + submits inquiries.
-- Writes require an admin role (profiles.role = 'admin'). A random signed-up
-- account can do NOTHING privileged.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------- updated_at helper -------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ============================================================================
-- PROFILES + ROLE  (the heart of authorization)
-- Every auth user gets a profile with role 'viewer' by default.
-- You promote yourself to 'admin' once (see bottom of file).
-- ============================================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       text not null default 'viewer' check (role in ('viewer','admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Single source of truth for "is this request an admin?"
-- SECURITY DEFINER so RLS policies can call it without recursive RLS checks.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_admin_all on public.profiles;
-- A user can read their own profile; admins can read all.
create policy profiles_self_read on public.profiles for select
  using (id = auth.uid() or public.is_admin());
-- Only admins may change roles (prevents self-promotion).
create policy profiles_admin_all on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- CATEGORIES
-- ============================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- PRODUCTS
-- ============================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references public.categories(id) on delete set null,
  brand text,
  model text,
  short_description text,
  description text,
  specs jsonb not null default '[]'::jsonb,
  price_text text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_published_idx on public.products (is_published);

alter table public.products
  add column if not exists search_tsv tsvector
  generated always as (to_tsvector('simple',
    coalesce(name,'')||' '||coalesce(brand,'')||' '||coalesce(model,'')||' '||
    coalesce(short_description,'')||' '||coalesce(description,''))) stored;
create index if not exists products_search_idx on public.products using gin (search_tsv);

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================================
-- PRODUCT IMAGES
-- ============================================================================
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt text,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images (product_id);

-- ============================================================================
-- INQUIRIES  (public submits; server-side length limits curb spam/abuse)
-- ============================================================================
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  phone text check (phone is null or char_length(phone) <= 40),
  company text check (company is null or char_length(company) <= 160),
  product_id uuid references public.products(id) on delete set null,
  subject text check (subject is null or char_length(subject) <= 200),
  message text not null check (char_length(message) between 1 and 4000),
  status text not null default 'new' check (status in ('new','read','archived')),
  created_at timestamptz not null default now()
);
create index if not exists inquiries_status_idx on public.inquiries (status, created_at desc);

-- ============================================================================
-- SITE SETTINGS (editable content blocks)
-- ============================================================================
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_settings_updated on public.site_settings;
create trigger trg_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.inquiries      enable row level security;
alter table public.site_settings  enable row level security;

-- CATEGORIES: public read, admin write
drop policy if exists cat_read on public.categories;
drop policy if exists cat_write on public.categories;
create policy cat_read  on public.categories for select using (true);
create policy cat_write on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- PRODUCTS: public reads published; admin reads all + writes
drop policy if exists prod_read on public.products;
drop policy if exists prod_write on public.products;
create policy prod_read on public.products for select
  using (is_published = true or public.is_admin());
create policy prod_write on public.products for all
  using (public.is_admin()) with check (public.is_admin());

-- PRODUCT IMAGES: public read, admin write
drop policy if exists img_read on public.product_images;
drop policy if exists img_write on public.product_images;
create policy img_read  on public.product_images for select using (true);
create policy img_write on public.product_images for all
  using (public.is_admin()) with check (public.is_admin());

-- INQUIRIES: anyone may insert; only admins may read/manage
drop policy if exists inq_insert on public.inquiries;
drop policy if exists inq_read on public.inquiries;
drop policy if exists inq_update on public.inquiries;
drop policy if exists inq_delete on public.inquiries;
create policy inq_insert on public.inquiries for insert with check (true);
create policy inq_read   on public.inquiries for select using (public.is_admin());
create policy inq_update on public.inquiries for update
  using (public.is_admin()) with check (public.is_admin());
create policy inq_delete on public.inquiries for delete using (public.is_admin());

-- SITE SETTINGS: public read, admin write
drop policy if exists set_read on public.site_settings;
drop policy if exists set_write on public.site_settings;
create policy set_read  on public.site_settings for select using (true);
create policy set_write on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- STORAGE: product-images bucket (public read, admin write only)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('product-images','product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images public read" on storage.objects;
drop policy if exists "product images admin write"  on storage.objects;
drop policy if exists "product images admin update" on storage.objects;
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images public read" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "product images admin write" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "product images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
create policy "product images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ============================================================================
-- SEED CONTENT — Lexus Industrial Enterprise Corporation (real product lines)
-- Edit/replace freely from the admin Content tab.
-- ============================================================================
insert into public.site_settings (key, value) values
  ('hero', '{"eyebrow":"Interior Finishings & Building Materials · Since 1995","title":"The premier source for your finishing and construction needs.","subtitle":"Wholesale and retail supplier of modern interior finishings and trusted international brands — boards, panels, drywall, ceiling systems, and more — from our head office in Metro Manila.","cta_label":"Browse products"}'),
  ('about', '{"title":"About Lexus Industrial","body":"Lexus Industrial Enterprise Corporation has been a leading wholesale and retail comprehensive company with the head office located in Metro Manila, Philippines. Since 1995, the company has been known for providing reputable modern interior finishings and also provides a selection of trusted international brands with high-grade features. We have built excellent relationships with major architects, architectural firms, interior designers and project management, while continuously promoting our product lines to the professionals of the construction industry and the general public.","stats":[{"label":"Established","value":"1995"},{"label":"Product lines","value":"18"},{"label":"Head office","value":"Metro Manila"}]}'),
  ('services', '{"title":"Our services","items":[{"title":"Supply and Distribution","body":"Wholesale and retail supply of interior finishing materials to projects nationwide."},{"title":"Lamination Services","body":"Professional lamination of boards and panels to your required finishes and sizes."},{"title":"Metal Production","body":"Fabrication of light steel frame and metal components for walls and ceilings."},{"title":"Cutting & Edging","body":"Precision cut-to-size and edgebanding for ready-to-install panels."}]}'),
  ('contact', '{"email":"am.unlayao@lexusindustrial.com.ph","phone":"","address":"Metro Manila, Philippines","hours":"Mon to Sat, 8:00 AM to 5:00 PM"}')
on conflict (key) do nothing;

insert into public.categories (name, slug, description, sort_order) values
  ('Scaffoldings','scaffoldings','System scaffolding, frames, and accessories for construction.',1),
  ('Phenolic Boards','phenolic-boards','Water-resistant phenolic plywood for formwork and surfaces.',2),
  ('Light Steel Frame','light-steel-frame','Metal framing for walls, partitions, and ceilings.',3),
  ('Drywall & Ceiling Accessories','drywall-ceiling-accessories','Channels, runners, and accessories for drywall and ceilings.',4),
  ('Fiber Cement Board','fiber-cement-board','Durable, moisture-resistant fiber cement boards.',5),
  ('Gypsum Boards','gypsum-boards','Standard, moisture- and fire-resistant gypsum boards.',6),
  ('Plaster Products','plaster-products','Plaster, jointing compounds, and finishing products.',7),
  ('Ceiling Tiles & Acoustic Boards','ceiling-tiles-acoustic-boards','Acoustic ceiling tiles and panels.',8),
  ('Moulded Door','moulded-door','Moulded skin doors and door components.',9),
  ('MDF, PB, Plywood, Plyboard, PVC','mdf-pb-plywood-plyboard-pvc','Engineered wood panels and PVC boards.',10),
  ('Melamine on MDF (4x8)','melamine-mdf-4x8','Melamine-faced MDF panels, 4x8.',11),
  ('Melamine on PB (4x8)(6x8)','melamine-pb','Melamine-faced particle board, 4x8 and 6x8.',12),
  ('Melamine on Marine (4x8)','melamine-marine-4x8','Melamine-faced marine plywood, 4x8.',13),
  ('Edgeband','edgeband','Edgebanding tapes in matching finishes.',14),
  ('Veneer Boards','veneer-boards','Natural wood veneer panels.',15),
  ('Kiiltava (Ultra High Gloss)','kiiltava-ultra-high-gloss','Ultra high gloss panels for premium finishes.',16),
  ('Toilet Accessories','toilet-accessories','Cubicle hardware and toilet accessories.',17),
  ('Compact Boards','compact-boards','High-pressure compact laminate boards.',18)
on conflict (slug) do nothing;

insert into public.products (name,slug,category_id,brand,model,short_description,description,specs,price_text,is_featured,is_published,sort_order)
select v.name,v.slug,(select id from public.categories where slug=v.cat),v.brand,v.model,v.sd,v.descr,v.specs::jsonb,v.price,v.feat,true,v.ord
from (values
 ('Phenolic Board 18mm (4x8)','phenolic-board-18mm-4x8','phenolic-boards','Lexus','PH-18','Water-resistant phenolic-faced plywood for formwork.','Film-faced phenolic plywood with a smooth, reusable surface for concrete formwork and durable worktops.','[{"label":"Thickness","value":"18 mm"},{"label":"Size","value":"4 x 8 ft"},{"label":"Surface","value":"Phenolic film, both faces"}]','Request a quote',true,1),
 ('Marine Phenolic Formwork 12mm','marine-phenolic-12mm','phenolic-boards','Lexus','PH-12','12mm phenolic formwork board.','Lighter 12mm phenolic board for lighter formwork and panelling applications.','[{"label":"Thickness","value":"12 mm"},{"label":"Size","value":"4 x 8 ft"}]','Request a quote',false,2),
 ('Light Steel Stud 76mm','light-steel-stud-76','light-steel-frame','Lexus','LSF-S76','Galvanized steel stud for partitions.','Roll-formed galvanized steel stud for drywall partition systems.','[{"label":"Profile","value":"Stud 76 mm"},{"label":"Length","value":"3.0 m"},{"label":"Finish","value":"Galvanized"}]','Request a quote',true,3),
 ('Light Steel Track 76mm','light-steel-track-76','light-steel-frame','Lexus','LSF-T76','Galvanized steel track for partitions.','Matching floor and ceiling track for 76mm stud partition systems.','[{"label":"Profile","value":"Track 76 mm"},{"label":"Length","value":"3.0 m"}]','Request a quote',false,4),
 ('Standard Gypsum Board 9mm (4x8)','gypsum-board-9mm-4x8','gypsum-boards','Lexus','GB-9','Standard gypsum board for walls and ceilings.','Tapered-edge gypsum plasterboard for interior walls and ceilings.','[{"label":"Thickness","value":"9 mm"},{"label":"Size","value":"4 x 8 ft"},{"label":"Edge","value":"Tapered"}]','Request a quote',true,5),
 ('Moisture-Resistant Gypsum 12mm','gypsum-mr-12mm','gypsum-boards','Lexus','GB-MR12','Moisture-resistant gypsum board.','Green-core moisture-resistant gypsum board for wet and humid areas.','[{"label":"Thickness","value":"12 mm"},{"label":"Type","value":"Moisture-resistant"},{"label":"Size","value":"4 x 8 ft"}]','Request a quote',false,6),
 ('Fiber Cement Board 6mm (4x8)','fiber-cement-6mm-4x8','fiber-cement-board','Lexus','FCB-6','Durable fiber cement board.','Moisture- and fire-resistant fiber cement board for ceilings, walls, and eaves.','[{"label":"Thickness","value":"6 mm"},{"label":"Size","value":"4 x 8 ft"}]','Request a quote',true,7),
 ('Acoustic Ceiling Tile 600x600','acoustic-ceiling-600','ceiling-tiles-acoustic-boards','Lexus','ACT-600','Mineral fiber acoustic ceiling tile.','Lay-in acoustic ceiling tile for suspended ceiling grids in offices and commercial spaces.','[{"label":"Size","value":"600 x 600 mm"},{"label":"System","value":"Lay-in T-grid"}]','Request a quote',false,8),
 ('Moulded Skin Door 800x2100','moulded-door-800','moulded-door','Lexus','MD-800','Moulded panel door, hollow core.','Moulded skin door with primed surface, ready for painting.','[{"label":"Size","value":"800 x 2100 mm"},{"label":"Core","value":"Hollow"},{"label":"Finish","value":"Primed"}]','Request a quote',false,9),
 ('Melamine on MDF White 18mm (4x8)','melamine-mdf-white-18','melamine-mdf-4x8','Lexus','MEL-MDF18','White melamine-faced MDF panel.','Smooth white melamine-faced MDF for cabinetry and interior joinery.','[{"label":"Thickness","value":"18 mm"},{"label":"Size","value":"4 x 8 ft"},{"label":"Finish","value":"White melamine"}]','Request a quote',true,10),
 ('PVC Edgeband 22mm','pvc-edgeband-22','edgeband','Lexus','EB-22','PVC edgebanding tape, 22mm.','Color-matched PVC edgeband for finishing panel edges.','[{"label":"Width","value":"22 mm"},{"label":"Material","value":"PVC"}]','Request a quote',false,11),
 ('Compact Board 12mm','compact-board-12','compact-boards','Lexus','CB-12','High-pressure compact laminate board.','Solid HPL compact board for partitions, lockers, and wet-area applications.','[{"label":"Thickness","value":"12 mm"},{"label":"Type","value":"HPL compact"}]','Request a quote',true,12),
 ('Frame Scaffold Set 1.7m','frame-scaffold-17','scaffoldings','Lexus','SC-17','Steel frame scaffold set.','Galvanized frame scaffolding set with cross braces for construction access.','[{"label":"Frame height","value":"1.7 m"},{"label":"Finish","value":"Galvanized"},{"label":"Includes","value":"2 frames + braces"}]','Request a quote',true,13)
) as v(name,slug,cat,brand,model,sd,descr,specs,price,feat,ord)
on conflict (slug) do nothing;

-- ============================================================================
-- MAKE YOURSELF ADMIN
-- 1) Authentication -> Users -> Add user (email + password, Auto Confirm).
-- 2) Run, with your email:
--      update public.profiles set role = 'admin'
--      where email = 'you@example.com';
-- 3) (Recommended) Authentication -> Providers -> Email: turn OFF public
--    "Allow new users to sign up" so only invited staff can ever exist.
-- ============================================================================
