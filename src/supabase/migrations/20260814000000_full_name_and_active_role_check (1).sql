-- ============================================================
-- Wisuda Management Tools — profiles.full_name + is_active-aware role check
-- Stage: Authentication + User Management (foundation)
-- Depends on: 20260813000001_rls_and_authorization.sql
-- Target: Supabase PostgreSQL
--
-- Two changes requested, plus one required consequential fix.
-- No table is dropped, no data is deleted, no existing column
-- is removed. Safe to re-run (CREATE OR REPLACE / IF EXISTS
-- throughout).
-- ============================================================

-- ------------------------------------------------------------
-- 1. profiles.full_name — display name, admin-editable later
--
--    Nullable on purpose: rows created during earlier RLS-stage
--    testing may not have a value, and this migration must not
--    fail against them. "Required" is enforced at the
--    application layer (provisioning endpoint), not by NOT NULL
--    here. CHECK still blocks an empty-but-not-null string.
-- ------------------------------------------------------------
alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  drop constraint if exists full_name_not_blank;

alter table public.profiles
  add constraint full_name_not_blank
  check (full_name is null or length(trim(full_name)) > 0);

-- ------------------------------------------------------------
-- 2. current_user_role() — now also requires is_active = true
--
--    Returns NULL (not the row's role) for a deactivated
--    account, even with a still-valid session/token. Every RLS
--    policy on every domain table, plus the authorization check
--    inside admin_update_user(), goes through this one function
--    — so this single change revokes operational data access
--    for a deactivated user everywhere at once, immediately,
--    without needing them to log out.
--
--    profiles_select_own is UNCHANGED and intentionally does
--    NOT use this function — it only checks `id = auth.uid()`.
--    An inactive user can still read their OWN profile row
--    (needed so the app can show "your account is inactive"
--    instead of a bare permission error), but that grants no
--    access to any operational table, and does not let them see
--    other users' profiles (profiles_select_admin_all DOES use
--    this function, so an inactive admin correctly loses that
--    visibility too).
--
--    CREATE OR REPLACE preserves the existing REVOKE/GRANT on
--    this function (signature is unchanged) — no need to repeat
--    the `revoke all ... / grant execute ... to authenticated`
--    statements from the RLS & Authorization migration.
-- ------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and is_active = true;
$$;

-- ------------------------------------------------------------
-- 3. Required fix inside admin_update_user() — not optional
--
--    PL/pgSQL's IF treats a NULL condition as false, not true.
--    The previous check was:
--        if public.current_user_role() <> 'admin' then raise ...
--    For a now-INACTIVE admin, current_user_role() returns NULL
--    after change #2 above, so `NULL <> 'admin'` evaluates to
--    NULL — and PL/pgSQL silently treats that IF as false,
--    skipping the exception entirely. Because this function is
--    SECURITY DEFINER and its UPDATE bypasses RLS by design,
--    that check is the ONLY gate protecting it — if it silently
--    passes, a deactivated admin could still change anyone's
--    role/is_active. This is a direct, otherwise-silent
--    consequence of change #2, so it is corrected in this same
--    migration rather than left as a gap.
--
--    Fix: `IS DISTINCT FROM` treats NULL as a real, comparable
--    value (NULL IS DISTINCT FROM 'admin' evaluates to true), so
--    the exception now fires correctly whether the caller is a
--    non-admin OR an inactive admin. No other logic in this
--    function changes — it still only ever writes role and
--    is_active, exactly as before.
-- ------------------------------------------------------------
create or replace function public.admin_update_user(
  p_target_user_id uuid,
  p_new_role public.user_role default null,
  p_new_is_active boolean default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result public.profiles;
begin
  if public.current_user_role() is distinct from 'admin' then
    raise exception 'only admin can update user role/status';
  end if;

  if p_new_role is null and p_new_is_active is null then
    raise exception 'nothing to update: provide new_role and/or new_is_active';
  end if;

  if not exists (select 1 from public.profiles where id = p_target_user_id) then
    raise exception 'target user not found';
  end if;

  update public.profiles
  set
    role = coalesce(p_new_role, role),
    is_active = coalesce(p_new_is_active, is_active)
  where id = p_target_user_id
  returning * into v_result;

  return v_result;
end;
$$;
