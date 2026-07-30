-- 0004_inquiry_insert_policy.sql
--
-- Restores public INSERT on inquiries.
--
-- 0001_rbac.sql re-created the inquiries policies for select/update/delete but
-- never re-created `inq_insert` (its own comment claims "public insert"). With
-- RLS enabled and no INSERT policy present, Postgres denies every insert, so
-- both the contact form and the footer newsletter failed with
-- `42501: new row violates row-level security policy for table "inquiries"`.
--
-- No `to` clause: the policy applies to PUBLIC (every role), matching the
-- original policy in schema.sql. This project authenticates with a new-style
-- `sb_publishable_…` key, so pinning the policy to `anon` is a guess about how
-- that key maps to a Postgres role — applying to PUBLIC sidesteps that entirely.
-- Reading inquiries stays staff-only via the separate `inq_read` policy.

alter table public.inquiries enable row level security;

drop policy if exists inq_insert on public.inquiries;
create policy inq_insert on public.inquiries
  for insert
  with check (true);

-- RLS governs *which rows* a role may write; the table grant governs whether it
-- may issue INSERT at all. Both are required.
grant insert on public.inquiries to anon, authenticated;
