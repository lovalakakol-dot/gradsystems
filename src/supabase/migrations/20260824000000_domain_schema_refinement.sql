-- ============================================================
-- Wisuda Management Tools — Domain Schema Refinement
-- Stage: Domain Schema Refinement (RAB, Cashbook, Rundown, Graduates)
-- Depends on: 20260814000000_full_name_and_active_role_check.sql
-- Target: Supabase PostgreSQL
--
-- Purely additive. No table dropped, no existing column dropped,
-- no existing migration touched, no RLS policy changed (none of
-- these changes require it — every change here is at the column
-- level on tables whose RLS already covers the whole row).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Shared division enum — used by BOTH rab_items and
--    cashbook_entries, so the two can never diverge in their
--    value sets. This is what makes RAB-vs-Realisasi comparison
--    in Laporan Keuangan safe by construction, not by convention.
--
--    Previously `division` was free text specifically because
--    the division list could change over time; the list is now
--    stated as final, so enum trades that flexibility for a
--    stronger guarantee that matters more here (cross-table
--    consistency). CREATE TYPE has no native IF NOT EXISTS in
--    PostgreSQL, so this is wrapped for idempotency.
-- ------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'division_code') then
    create type public.division_code as enum (
      'Badan Pengurus Harian',
      'Divisi Acara',
      'Divisi Pendataan',
      'Divisi Media',
      'Divisi Humas',
      'Divisi Logistik'
    );
  end if;
end $$;

-- ------------------------------------------------------------
-- 2. shirt_size, verification_status — two-value enums,
--    consistent with the pattern already used for user_role,
--    currency_code, cashbook_type.
-- ------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'shirt_size') then
    create type public.shirt_size as enum ('large', 'small');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'verification_status') then
    create type public.verification_status as enum ('done', 'not_yet');
  end if;
end $$;

-- ------------------------------------------------------------
-- 3. rab_items — quantity, unit, division type conversion
--
--    quantity/unit are both nullable: "required" is an
--    application-layer concern (same convention as
--    profiles.full_name), not a NOT NULL constraint, since this
--    migration must not fail against any existing rows that
--    predate these columns.
--
--    division converts from free text to the shared enum above.
--    ASSUMPTION, stated explicitly: rab_items has no real rows
--    yet (the RAB Builder frontend has never been built), so
--    this cast is expected to succeed cleanly. If it fails, that
--    means non-conforming division text already exists in the
--    table — the migration stops with a clear Postgres error
--    naming the value, rather than silently coercing or losing
--    it; that data would need correcting (or the value added to
--    the enum) before re-running this migration.
-- ------------------------------------------------------------
alter table public.rab_items
  add column if not exists quantity numeric(12, 2);

alter table public.rab_items
  add column if not exists unit text;

alter table public.rab_items
  drop constraint if exists quantity_positive;
alter table public.rab_items
  add constraint quantity_positive check (quantity is null or quantity > 0);

alter table public.rab_items
  drop constraint if exists unit_not_blank;
alter table public.rab_items
  add constraint unit_not_blank check (unit is null or length(trim(unit)) > 0);

alter table public.rab_items
  alter column division type public.division_code
  using division::public.division_code;

-- Superseded: an enum value can't be blank by construction.
alter table public.rab_items
  drop constraint if exists division_not_blank;

comment on column public.rab_items.quantity is
  'Descriptive quantity (pcs/kg/liter/etc) — informational only, NOT used to compute estimated_cost. unit_price is deliberately not modeled (not required yet).';
comment on column public.rab_items.unit is
  'Free-text unit label (pcs, kg, liter, ...) paired with quantity.';

-- ------------------------------------------------------------
-- 4. cashbook_entries — division (new column, shares the same
--    enum type as rab_items.division so RAB-vs-Realisasi
--    comparisons in Laporan Keuangan always compare like with
--    like).
--
--    payment_method, pic, description, attachment_url are
--    UNTOUCHED — still present, still unused by the current UI
--    scope, kept for backward compatibility as instructed.
-- ------------------------------------------------------------
alter table public.cashbook_entries
  add column if not exists division public.division_code;

comment on column public.cashbook_entries.division is
  'Shares division_code with rab_items.division by design — keeps RAB vs realisasi comparisons in Laporan Keuangan consistent by construction.';

-- ------------------------------------------------------------
-- 5. rundown_items — duration_minutes, plus end_time handling
--
--    duration_minutes: nullable, the intended source of truth
--    (together with start_time) for the cascading start-time
--    computation done at the application layer
--    (next_start = previous_start + previous_duration_minutes).
--
--    end_time: NOT dropped (per instruction), but relaxed from
--    NOT NULL to nullable, and the old end_after_start CHECK is
--    relaxed to only apply when both values are present.
--
--    Why not make end_time a GENERATED column (computed from
--    start_time + duration_minutes) instead of just relaxing it?
--    PostgreSQL cannot add a GENERATED expression to an
--    already-existing plain column — doing so requires dropping
--    and recreating the column, which would silently discard
--    whatever real end_time values already exist for any row
--    where duration_minutes is still NULL (true for every
--    existing row immediately after this migration, since
--    duration_minutes starts empty everywhere). That is a real
--    data-loss risk this migration must not take.
--
--    Recommendation instead (application-layer, not enforced by
--    this migration): treat start_time + duration_minutes as the
--    real source of truth; if end_time should still be populated
--    for display/compatibility, compute and write it alongside
--    duration_minutes on every insert/update. end_time is not
--    database-enforced to stay in sync going forward, but it is
--    also never silently dropped or corrupted by this migration.
-- ------------------------------------------------------------
alter table public.rundown_items
  add column if not exists duration_minutes integer;

alter table public.rundown_items
  drop constraint if exists duration_minutes_positive;
alter table public.rundown_items
  add constraint duration_minutes_positive
  check (duration_minutes is null or duration_minutes > 0);

alter table public.rundown_items
  alter column end_time drop not null;

alter table public.rundown_items
  drop constraint if exists end_after_start;
alter table public.rundown_items
  add constraint end_after_start
  check (end_time is null or start_time is null or end_time > start_time);

comment on column public.rundown_items.duration_minutes is
  'Minutes. Together with start_time, this is the intended source of truth for cascading start-time computation at the application layer (next item''s start_time = this start_time + this duration_minutes).';
comment on column public.rundown_items.end_time is
  'Kept for backward compatibility, no longer NOT NULL. Not database-enforced to stay in sync with start_time + duration_minutes — see migration header comment above for why a GENERATED column was not safe to introduce here.';

-- ------------------------------------------------------------
-- 5b. rundown_items — officer, pic, needs
--
--    Tiga field independen, sengaja tidak digabung:
--    - officer : siapa yang bertugas/tampil pada sesi ini (Petugas)
--    - pic     : penanggung jawab sesi (PIC), bisa berbeda dari officer
--    - needs   : kebutuhan teknis/logistik untuk sesi ini (Kebutuhan)
--
--    Nullable, mengikuti konvensi "required = urusan
--    application layer" yang sama dengan kolom lain di migration
--    ini, agar tidak gagal terhadap baris yang sudah ada.
-- ------------------------------------------------------------
alter table public.rundown_items
  add column if not exists officer text;

alter table public.rundown_items
  drop constraint if exists officer_not_blank;
alter table public.rundown_items
  add constraint officer_not_blank
  check (officer is null or length(trim(officer)) > 0);

alter table public.rundown_items
  add column if not exists pic text;

alter table public.rundown_items
  drop constraint if exists pic_not_blank;
alter table public.rundown_items
  add constraint pic_not_blank
  check (pic is null or length(trim(pic)) > 0);

alter table public.rundown_items
  add column if not exists needs text;

alter table public.rundown_items
  drop constraint if exists needs_not_blank;
alter table public.rundown_items
  add constraint needs_not_blank
  check (needs is null or length(trim(needs)) > 0);

comment on column public.rundown_items.officer is
  'Petugas — orang yang bertugas/tampil pada sesi rundown ini.';
comment on column public.rundown_items.pic is
  'PIC — penanggung jawab sesi ini, independen dari officer.';
comment on column public.rundown_items.needs is
  'Kebutuhan — kebutuhan teknis/logistik untuk sesi ini (mic, proyektor, dst).';

-- ------------------------------------------------------------
-- 6. graduates — full_name_ar, country_code, shirt_size,
--    verification_status
--
--    full_name_ar, country_code, shirt_size: nullable, same
--    "required is an app-layer concern" convention as
--    profiles.full_name — this migration must not fail against
--    existing rows.
--
--    verification_status: NOT NULL DEFAULT 'not_yet' — unlike
--    the other three, this has an unambiguous, safe default that
--    also makes sense applied to any pre-existing row (an
--    unconfirmed graduate's verification status is genuinely
--    "not yet", not unknown-in-a-way-that-needs-NULL), so
--    existing rows get a real value rather than NULL. Modern
--    Postgres applies a constant DEFAULT to existing rows without
--    a full table rewrite.
-- ------------------------------------------------------------
alter table public.graduates
  add column if not exists full_name_ar text;

alter table public.graduates
  drop constraint if exists full_name_ar_not_blank;
alter table public.graduates
  add constraint full_name_ar_not_blank
  check (full_name_ar is null or length(trim(full_name_ar)) > 0);

alter table public.graduates
  add column if not exists country_code text;

alter table public.graduates
  drop constraint if exists country_code_format;
alter table public.graduates
  add constraint country_code_format
  check (country_code is null or country_code ~ '^[A-Z]{2}$');

alter table public.graduates
  add column if not exists shirt_size public.shirt_size;

alter table public.graduates
  add column if not exists verification_status public.verification_status
  not null default 'not_yet';

comment on column public.graduates.full_name_ar is
  'Full name in Arabic script.';
comment on column public.graduates.country_code is
  'ISO 3166-1 alpha-2 code (e.g. EG, ID, SA) — stable identifier only. The Arabic country-name dictionary lives in the frontend, keyed by this code; the full country list is deliberately not stored in the database.';
comment on column public.graduates.shirt_size is
  'large or small only, per current requirement.';
comment on column public.graduates.verification_status is
  'done or not_yet. Defaults to not_yet, including for rows that existed before this column was added.';