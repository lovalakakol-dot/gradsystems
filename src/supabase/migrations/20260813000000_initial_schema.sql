-- ============================================================
-- Wisuda Management Tools — Initial Database Schema
-- Stage: Database Schema (pre-RLS)
-- Target: Supabase PostgreSQL
--
-- NOTE: RLS is enabled on every table at the end of this file,
-- but NO POLICIES are created here. With RLS enabled and zero
-- policies, Postgres denies all access to non-superuser roles
-- by default — this is intentional: it closes the gap between
-- "table exists" and "table is protected". Policies are added
-- in the next stage (RLS / Authorization).
-- ============================================================

-- ------------------------------------------------------------
-- 0. Extensions
-- ------------------------------------------------------------
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. Enum types
-- ------------------------------------------------------------
create type public.user_role as enum ('admin', 'bendahara', 'pendataan', 'acara');
create type public.currency_code as enum ('IDR', 'EGP');
create type public.cashbook_type as enum ('income', 'expense');

-- ------------------------------------------------------------
-- 2. Shared trigger function: auto-maintain updated_at
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 3. profiles
--    1:1 with auth.users. Source of truth for role & status.
-- ------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text not null unique,
  role        public.user_role not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint username_not_blank check (length(trim(username)) > 0)
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

comment on table public.profiles is
  'Application identity, 1:1 with auth.users. Source of truth for role and active status. Username is unique and intended to be immutable — enforced at application/RLS layer, not by a DB trigger.';

-- ------------------------------------------------------------
-- 4. audit_logs
--    Admin/system activity trail. Append-only (no updated_at).
-- ------------------------------------------------------------
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid not null references public.profiles (id) on delete restrict,
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index idx_audit_logs_actor_id on public.audit_logs (actor_id);
create index idx_audit_logs_entity on public.audit_logs (entity_type, entity_id);
create index idx_audit_logs_created_at on public.audit_logs (created_at);

comment on table public.audit_logs is
  'Admin/system activity trail. Immutable by convention — rows are inserted, never updated.';

-- ------------------------------------------------------------
-- 5. rab_items
--    Centralized budget plan, owned by Bendahara.
--    division is a category tag only, NOT a permission boundary.
-- ------------------------------------------------------------
create table public.rab_items (
  id              uuid primary key default gen_random_uuid(),
  item_name       text not null,
  quantity        numeric,
  division        text not null,
  estimated_cost  numeric(14, 2) not null,
  currency        public.currency_code not null,
  description     text,
  created_by      uuid not null references public.profiles (id) on delete restrict,
  updated_by      uuid references public.profiles (id) on delete restrict,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint item_name_not_blank check (length(trim(item_name)) > 0),
  constraint division_not_blank check (length(trim(division)) > 0),
  constraint estimated_cost_positive check (estimated_cost > 0)
);

create trigger trg_rab_items_updated_at
  before update on public.rab_items
  for each row execute function public.set_updated_at();

create index idx_rab_items_division on public.rab_items (division);

comment on table public.rab_items is
  'Centralized budget plan covering all divisions, owned exclusively by Bendahara. division is descriptive metadata only.';

-- ------------------------------------------------------------
-- 6. cashbook_entries
--    Source of truth for realized transactions (Buku Kas).
--    amount is always positive; direction comes from `type`.
--    Opening-balance mechanism is a business decision deferred
--    to the Buku Kas / Laporan Keuangan design stage.
-- ------------------------------------------------------------
create table public.cashbook_entries (
  id                uuid primary key default gen_random_uuid(),
  transaction_date  date not null,
  type              public.cashbook_type not null,
  category          text not null,
  description       text,
  amount            numeric(14, 2) not null,
  currency          public.currency_code not null,
  payment_method    text not null,
  pic               text,
  attachment_url    text,
  created_by        uuid not null references public.profiles (id) on delete restrict,
  updated_by        uuid references public.profiles (id) on delete restrict,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint category_not_blank check (length(trim(category)) > 0),
  constraint payment_method_not_blank check (length(trim(payment_method)) > 0),
  constraint amount_positive check (amount > 0)
);

create trigger trg_cashbook_entries_updated_at
  before update on public.cashbook_entries
  for each row execute function public.set_updated_at();

create index idx_cashbook_entries_date on public.cashbook_entries (transaction_date);
create index idx_cashbook_entries_type on public.cashbook_entries (type);
create index idx_cashbook_entries_category on public.cashbook_entries (category);

comment on table public.cashbook_entries is
  'Source of truth for realized cash transactions. No financial_reports table exists — Laporan Keuangan reads/aggregates this table directly.';

-- ------------------------------------------------------------
-- 7. graduates
--    Intentionally minimal — academic/status fields are not
--    yet confirmed with Divisi Pendataan. Expect an additive
--    migration once the real field list is known.
-- ------------------------------------------------------------
create table public.graduates (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  created_by  uuid not null references public.profiles (id) on delete restrict,
  updated_by  uuid references public.profiles (id) on delete restrict,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint full_name_not_blank check (length(trim(full_name)) > 0)
);

create trigger trg_graduates_updated_at
  before update on public.graduates
  for each row execute function public.set_updated_at();

comment on table public.graduates is
  'Intentionally minimal. Academic/status fields deliberately omitted pending confirmation from Divisi Pendataan — do not guess additional business fields here.';

-- ------------------------------------------------------------
-- 8. rundown_items
--    Single flat rundown for this wisuda period.
--    ASSUMPTION: single-day event (time only, no date column).
-- ------------------------------------------------------------
create table public.rundown_items (
  id                uuid primary key default gen_random_uuid(),
  activity          text not null,
  start_time        time not null,
  end_time          time not null,
  person_in_charge  text,
  location          text,
  notes             text,
  sort_order        integer not null,
  created_by        uuid not null references public.profiles (id) on delete restrict,
  updated_by        uuid references public.profiles (id) on delete restrict,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint activity_not_blank check (length(trim(activity)) > 0),
  constraint end_after_start check (end_time > start_time)
);

create trigger trg_rundown_items_updated_at
  before update on public.rundown_items
  for each row execute function public.set_updated_at();

comment on table public.rundown_items is
  'Single flat rundown table (no parent rundowns table). ASSUMPTION: event fits within one day — confirm before relying on time-only columns.';

-- ------------------------------------------------------------
-- 9. Enable RLS on every table — no policies yet.
--    See header note: this is intentional default-deny.
-- ------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.audit_logs       enable row level security;
alter table public.rab_items        enable row level security;
alter table public.cashbook_entries enable row level security;
alter table public.graduates        enable row level security;
alter table public.rundown_items    enable row level security;
ALTER TABLE public.rab_items 
ADD COLUMN IF NOT EXISTS quantity NUMERIC NOT NULL DEFAULT 1;
-- Refresh schema cache
NOTIFY pgrst, 'reload schema';