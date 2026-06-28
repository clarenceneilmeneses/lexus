-- =============================================================================
-- Migration 0002 — Audit log (change history / audit trail)
-- Run AFTER 0001_rbac.sql:  Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Idempotent: safe to re-run.
--
-- Records every INSERT / UPDATE / DELETE on the content tables, capturing:
--   who did it (actor_id / actor_email, via auth.uid()),
--   what they did (action), to which record (entity + entity_id + label),
--   and — for updates — a field-level diff ({field: {from, to}}).
--
-- Writes are done by a SECURITY DEFINER trigger, so the table is INSERT-only
-- from the database's side and tamper-proof from clients (no write policies).
-- Admins can read it; nobody can edit or delete rows through the API.
-- =============================================================================

create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references auth.users(id) on delete set null,
  actor_email text,
  action      text not null check (action in ('insert','update','delete')),
  entity      text not null,           -- table name: products | categories | site_settings | profiles
  entity_id   text,                    -- row id (or settings key)
  label       text,                    -- human-friendly name (product/category name, settings key, email)
  changes     jsonb,                   -- update: {field:{from,to}} · insert/delete: row snapshot
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);
create index if not exists audit_log_entity_idx  on public.audit_log (entity, created_at desc);

-- ---------- Generic trigger function -----------------------------------------
-- Works across tables by reading rows as jsonb, so it never references a column
-- a given table doesn't have. Noisy/derived columns are stripped from diffs.
create or replace function public.log_audit()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_actor  uuid := auth.uid();
  v_email  text;
  v_old    jsonb := case when TG_OP <> 'INSERT' then to_jsonb(OLD) else '{}'::jsonb end;
  v_new    jsonb := case when TG_OP <> 'DELETE' then to_jsonb(NEW) else '{}'::jsonb end;
  v_row    jsonb := case when TG_OP = 'DELETE' then v_old else v_new end;
  v_noise  text[] := array['updated_at','created_at','search_tsv'];
  v_id     text;
  v_label  text;
  v_changes jsonb;
begin
  if v_actor is not null then
    select email into v_email from public.profiles where id = v_actor;
  end if;

  v_id    := coalesce(v_row->>'id', v_row->>'key');
  v_label := coalesce(v_row->>'name', v_row->>'key', v_row->>'email', v_id);

  if TG_OP = 'UPDATE' then
    -- field-level diff, ignoring derived/timestamp columns
    select jsonb_object_agg(n.key, jsonb_build_object('from', v_old->n.key, 'to', n.value))
      into v_changes
    from jsonb_each(v_new) n
    where (v_old->n.key) is distinct from n.value
      and not (n.key = any(v_noise));
    -- nothing meaningful changed (e.g. a no-op save) -> don't log
    if v_changes is null then
      return NEW;
    end if;
  else
    -- insert/delete: store a cleaned snapshot
    v_changes := v_row - 'search_tsv';
  end if;

  insert into public.audit_log (actor_id, actor_email, action, entity, entity_id, label, changes)
  values (v_actor, v_email, lower(TG_OP), TG_TABLE_NAME, v_id, v_label, v_changes);

  return coalesce(NEW, OLD);
end; $$;

-- ---------- Attach to the audited tables -------------------------------------
drop trigger if exists trg_audit_products on public.products;
create trigger trg_audit_products
  after insert or update or delete on public.products
  for each row execute function public.log_audit();

drop trigger if exists trg_audit_categories on public.categories;
create trigger trg_audit_categories
  after insert or update or delete on public.categories
  for each row execute function public.log_audit();

drop trigger if exists trg_audit_settings on public.site_settings;
create trigger trg_audit_settings
  after insert or update or delete on public.site_settings
  for each row execute function public.log_audit();

drop trigger if exists trg_audit_profiles on public.profiles;
create trigger trg_audit_profiles
  after insert or update or delete on public.profiles
  for each row execute function public.log_audit();

-- ---------- RLS: admins read; nobody writes via the API ----------------------
alter table public.audit_log enable row level security;
drop policy if exists audit_admin_read on public.audit_log;
create policy audit_admin_read on public.audit_log for select using (public.is_admin());
-- No insert/update/delete policies on purpose: only the SECURITY DEFINER trigger
-- (which runs as the table owner and bypasses RLS) may write here.
