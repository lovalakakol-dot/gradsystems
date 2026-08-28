-- ============================================================
-- Wisuda Management Tools — Graduates: Participant Number + WhatsApp
-- Stage: Additive column migration
-- Depends on: 20260824000000_domain_schema_refinement.sql
-- Target: Supabase PostgreSQL
--
-- Purely additive. No table dropped, no existing column dropped,
-- no existing migration touched, no RLS policy changed (the
-- existing graduates_*_pendataan policies already cover the whole
-- row, so new columns are automatically covered).
-- ============================================================

-- ------------------------------------------------------------
-- participant_number — "No. Peserta"
--
-- Stored as text, not integer: participant numbers in practice
-- often carry leading zeros or a cohort prefix (e.g. "007",
-- "2026-014"), which a numeric column would silently mangle.
-- Nullable, same "required is an application-layer concern"
-- convention as every other field added in the previous
-- migration — this must not fail against any existing rows.
-- ------------------------------------------------------------
alter table public.graduates
  add column if not exists participant_number text;

alter table public.graduates
  drop constraint if exists participant_number_not_blank;
alter table public.graduates
  add constraint participant_number_not_blank
  check (participant_number is null or length(trim(participant_number)) > 0);

comment on column public.graduates.participant_number is
  'Peserta''s participant number, free-text (may include leading zeros or a cohort prefix). Not the same as the table''s display row number, which is never persisted.';

-- ------------------------------------------------------------
-- whatsapp_number — "No. WhatsApp"
--
-- Stored as text, digits expected in international format
-- without a leading 0 (e.g. "6281234567890"), since that is what
-- a wa.me link requires. This migration does not enforce that
-- format at the database level — students from many different
-- countries fill this in, and guessing/rewriting a country code
-- from a bare leading 0 would be unreliable. The application
-- layer validates and the frontend hints the expected format at
-- entry time.
-- ------------------------------------------------------------
alter table public.graduates
  add column if not exists whatsapp_number text;

alter table public.graduates
  drop constraint if exists whatsapp_number_not_blank;
alter table public.graduates
  add constraint whatsapp_number_not_blank
  check (whatsapp_number is null or length(trim(whatsapp_number)) > 0);

comment on column public.graduates.whatsapp_number is
  'Expected in international format without a leading 0 (e.g. 6281234567890) so it can be used directly in a wa.me link. Not validated/rewritten at the database layer — see application-layer validation.';

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
