-- =============================================================================
-- Category hero image — used for the home "Shop by category" image-card grid.
-- Stores a storage path in the existing public `product-images` bucket
-- (resolve to a URL with imgUrl(path), same as service-card images).
-- Run once: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- =============================================================================
alter table public.categories
  add column if not exists image_path text;
