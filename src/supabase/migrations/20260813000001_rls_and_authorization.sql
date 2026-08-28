-- ============================================================
-- Wisuda Management Tools — RLS & Authorization
-- Stage: RLS / Authorization
-- Depends on: 20260813000000_initial_schema.sql
-- Target: Supabase PostgreSQL
--
-- This migration does NOT drop tables, drop columns, or delete
-- data. It only adds: one helper function, four trigger
-- functions (replacing the simpler set_updated_at trigger on
-- the four domain tables), and RLS policies. Written to be
-- safely re-runnable (drop-if-exists before every trigger and
-- policy).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Helper function: current_user_role()
--
--    SECURITY DEFINER is required here (not a default choice):
--    when this function is called from inside a policy on
--    `profiles` itself (the admin-scoped policies below), a
--    SECURITY INVOKER version would have its internal SELECT
--    re-evaluate the very policy that called it -> infinite
--    recursion, which Postgres will reject outright. Running as
--    DEFINER breaks that cycle because the internal SELECT runs
--    with the function owner's privileges, not the caller's.
--
--    search_path is pinned to prevent search_path hijacking
--    (a real risk specifically for SECURITY DEFINER functions).
--    STABLE lets Postgres avoid re-evaluating it per row within
--    one statement. EXECUTE is revoked from PUBLIC and granted
--    only to `authenticated` — anon has no use for it, since
--    auth.uid() is NULL for anon and no policy would grant
--    anything from that result anyway.
-- ------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

-- ------------------------------------------------------------
-- 2. Trigger: force created_by / updated_by server-side
--
--    SECURITY INVOKER (default, no clause needed) is sufficient
--    here — this function only manipulates NEW/OLD in memory,
--    it does not query any table that requires elevated
--    privilege, so it does not need SECURITY DEFINER.
--
--    Any created_by/updated_by value sent by the client is
--    ignored outright, not merely validated. This runs BEFORE
--    the row is evaluated against RLS WITH CHECK, so by the
--    time the policy checks the row, these columns are already
--    guaranteed correct — the policy below only needs to check
--    role membership.
--
--    Replaces the simpler set_updated_at trigger on the four
--    domain tables that carry created_by/updated_by (profiles
--    has no such columns and keeps using set_updated_at as-is).
-- ------------------------------------------------------------
create or replace function public.set_audit_columns()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if TG_OP = 'INSERT' then
    new.created_by := auth.uid();
    new.updated_by := null;
    new.created_at := now();
    new.updated_at := now();
  elsif TG_OP = 'UPDATE' then
    new.created_by := old.created_by;   -- immutable regardless of client input
    new.created_at := old.created_at;   -- immutable regardless of client input
    new.updated_by := auth.uid();
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_rab_items_updated_at on public.rab_items;
drop trigger if exists trg_rab_items_audit_columns on public.rab_items;
create trigger trg_rab_items_audit_columns
  before insert or update on public.rab_items
  for each row execute function public.set_audit_columns();

drop trigger if exists trg_cashbook_entries_updated_at on public.cashbook_entries;
drop trigger if exists trg_cashbook_entries_audit_columns on public.cashbook_entries;
create trigger trg_cashbook_entries_audit_columns
  before insert or update on public.cashbook_entries
  for each row execute function public.set_audit_columns();

drop trigger if exists trg_graduates_updated_at on public.graduates;
drop trigger if exists trg_graduates_audit_columns on public.graduates;
create trigger trg_graduates_audit_columns
  before insert or update on public.graduates
  for each row execute function public.set_audit_columns();

drop trigger if exists trg_rundown_items_updated_at on public.rundown_items;
drop trigger if exists trg_rundown_items_audit_columns on public.rundown_items;
create trigger trg_rundown_items_audit_columns
  before insert or update on public.rundown_items
  for each row execute function public.set_audit_columns();

-- ------------------------------------------------------------
-- 3. profiles: username immutability
--
--    A data-integrity rule, not an authorization rule — applies
--    regardless of caller, including admin. SECURITY INVOKER
--    (default) is sufficient: no elevated privilege needed, it
--    only compares NEW/OLD and raises an exception.
-- ------------------------------------------------------------
create or replace function public.prevent_username_change()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.username is distinct from old.username then
    raise exception 'username is immutable and cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_prevent_username_change on public.profiles;
create trigger trg_profiles_prevent_username_change
  before update on public.profiles
  for each row execute function public.prevent_username_change();

-- ------------------------------------------------------------
-- 4. profiles: audit log on role / is_active change
--
--    SECURITY DEFINER is required here — it must INSERT into
--    audit_logs, a table `authenticated` has zero INSERT policy
--    on. actor_id always comes from auth.uid() computed inside
--    this function, never from client-supplied input, so it
--    cannot be forged. Only fires when role or is_active
--    actually changed (avoids logging no-op updates).
--
--    Not a public API: this function only ever runs as a
--    trigger, never called directly. EXECUTE is revoked from
--    PUBLIC and not granted to any role — trigger firing does
--    not require EXECUTE privilege on the firing role, so this
--    closes off direct invocation without affecting the trigger.
-- ------------------------------------------------------------
create or replace function public.log_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role or new.is_active is distinct from old.is_active then
    insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
    values (
      auth.uid(),
      'profile.updated',
      'profile',
      new.id,
      jsonb_build_object(
        'old_role', old.role,
        'new_role', new.role,
        'old_is_active', old.is_active,
        'new_is_active', new.is_active
      )
    );
  end if;
  return new;
end;
$$;

revoke all on function public.log_profile_changes() from public;

drop trigger if exists trg_profiles_audit_log on public.profiles;
create trigger trg_profiles_audit_log
  after update on public.profiles
  for each row execute function public.log_profile_changes();

-- ------------------------------------------------------------
-- 5. RLS Policies — profiles
--
--    No INSERT / DELETE policy for `authenticated` at all.
--    Row creation happens exclusively via the server-side
--    provisioning endpoint using the service role key, which
--    bypasses RLS by design. Hard deletion of a profile is not
--    a supported application flow (deactivate via is_active).
--
--    IMPORTANT: there is NO blanket UPDATE policy on profiles,
--    not even for admin. A row/column USING+WITH CHECK policy
--    cannot restrict *which columns* an UPDATE touches — it can
--    only allow or deny the whole statement. Since admin must be
--    able to change role/is_active but must NOT be able to
--    freely rewrite id/username/created_at, direct UPDATE access
--    is closed off entirely, and role/is_active changes are
--    routed through admin_update_user() below instead — a
--    SECURITY DEFINER function whose UPDATE statement only ever
--    SETs role and is_active, by construction, not by policy.
-- ------------------------------------------------------------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists profiles_select_admin_all on public.profiles;
create policy profiles_select_admin_all
  on public.profiles
  for select
  to authenticated
  using (public.current_user_role() = 'admin');

-- Superseded: no direct UPDATE policy for authenticated/admin.
drop policy if exists profiles_update_admin on public.profiles;

-- ------------------------------------------------------------
-- 5b. Controlled admin write path: admin_update_user()
--
--    SECURITY DEFINER is required — with no UPDATE policy on
--    profiles at all, only a function running with the definer's
--    (RLS-bypassing) privileges can perform the UPDATE.
--
--    Authorization check happens INSIDE the function body via
--    current_user_role(), which reads auth.uid() from the
--    calling session — SECURITY DEFINER changes privilege for
--    the UPDATE itself, it does NOT change what auth.uid()
--    resolves to, so this check always reflects the real caller,
--    never the function owner.
--
--    Column scope is enforced by construction: the UPDATE
--    statement below only ever SETs role and is_active. id,
--    username, and created_at are never part of the SET clause,
--    so they cannot change through this function no matter what
--    is passed in — there is no parameter for them at all.
--    username is additionally protected by the
--    prevent_username_change trigger (defense in depth, in case
--    any future code path ever attempts to touch it).
--
--    Auditing: deliberately does NOT insert into audit_logs
--    itself. The UPDATE it performs still fires the existing
--    trg_profiles_audit_log trigger (section 4), which already
--    logs role/is_active changes generically with actor_id =
--    auth.uid(). Logging here as well would just duplicate that
--    entry — one write path, one log entry, no redundancy.
--
--    p_new_role / p_new_is_active default to NULL and are
--    applied with COALESCE, so a caller can change just one of
--    the two without needing to know the current value of the
--    other.
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
  if public.current_user_role() <> 'admin' then
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

revoke all on function public.admin_update_user(uuid, public.user_role, boolean) from public;
grant execute on function public.admin_update_user(uuid, public.user_role, boolean) to authenticated;

-- ------------------------------------------------------------
-- 6. RLS Policies — audit_logs
--
--    Admin read-only. No INSERT / UPDATE / DELETE policy for
--    `authenticated` at all — rows are written only by the
--    SECURITY DEFINER trigger above and by the trusted
--    server-side provisioning endpoint (service role).
-- ------------------------------------------------------------
drop policy if exists audit_logs_select_admin on public.audit_logs;
create policy audit_logs_select_admin
  on public.audit_logs
  for select
  to authenticated
  using (public.current_user_role() = 'admin');

-- ------------------------------------------------------------
-- 7. RLS Policies — rab_items (Bendahara only)
-- ------------------------------------------------------------
drop policy if exists rab_items_select_bendahara on public.rab_items;
create policy rab_items_select_bendahara
  on public.rab_items for select to authenticated
  using (public.current_user_role() = 'bendahara');

drop policy if exists rab_items_insert_bendahara on public.rab_items;
create policy rab_items_insert_bendahara
  on public.rab_items for insert to authenticated
  with check (public.current_user_role() = 'bendahara');

drop policy if exists rab_items_update_bendahara on public.rab_items;
create policy rab_items_update_bendahara
  on public.rab_items for update to authenticated
  using (public.current_user_role() = 'bendahara')
  with check (public.current_user_role() = 'bendahara');

drop policy if exists rab_items_delete_bendahara on public.rab_items;
create policy rab_items_delete_bendahara
  on public.rab_items for delete to authenticated
  using (public.current_user_role() = 'bendahara');

-- ------------------------------------------------------------
-- 8. RLS Policies — cashbook_entries (Bendahara only)
-- ------------------------------------------------------------
drop policy if exists cashbook_entries_select_bendahara on public.cashbook_entries;
create policy cashbook_entries_select_bendahara
  on public.cashbook_entries for select to authenticated
  using (public.current_user_role() = 'bendahara');

drop policy if exists cashbook_entries_insert_bendahara on public.cashbook_entries;
create policy cashbook_entries_insert_bendahara
  on public.cashbook_entries for insert to authenticated
  with check (public.current_user_role() = 'bendahara');

drop policy if exists cashbook_entries_update_bendahara on public.cashbook_entries;
create policy cashbook_entries_update_bendahara
  on public.cashbook_entries for update to authenticated
  using (public.current_user_role() = 'bendahara')
  with check (public.current_user_role() = 'bendahara');

drop policy if exists cashbook_entries_delete_bendahara on public.cashbook_entries;
create policy cashbook_entries_delete_bendahara
  on public.cashbook_entries for delete to authenticated
  using (public.current_user_role() = 'bendahara');

-- ------------------------------------------------------------
-- 9. RLS Policies — graduates (Pendataan only)
-- ------------------------------------------------------------
drop policy if exists graduates_select_pendataan on public.graduates;
create policy graduates_select_pendataan
  on public.graduates for select to authenticated
  using (public.current_user_role() = 'pendataan');

drop policy if exists graduates_insert_pendataan on public.graduates;
create policy graduates_insert_pendataan
  on public.graduates for insert to authenticated
  with check (public.current_user_role() = 'pendataan');

drop policy if exists graduates_update_pendataan on public.graduates;
create policy graduates_update_pendataan
  on public.graduates for update to authenticated
  using (public.current_user_role() = 'pendataan')
  with check (public.current_user_role() = 'pendataan');

drop policy if exists graduates_delete_pendataan on public.graduates;
create policy graduates_delete_pendataan
  on public.graduates for delete to authenticated
  using (public.current_user_role() = 'pendataan');

-- ------------------------------------------------------------
-- 10. RLS Policies — rundown_items (Acara only)
-- ------------------------------------------------------------
drop policy if exists rundown_items_select_acara on public.rundown_items;
create policy rundown_items_select_acara
  on public.rundown_items for select to authenticated
  using (public.current_user_role() = 'acara');

drop policy if exists rundown_items_insert_acara on public.rundown_items;
create policy rundown_items_insert_acara
  on public.rundown_items for insert to authenticated
  with check (public.current_user_role() = 'acara');

drop policy if exists rundown_items_update_acara on public.rundown_items;
create policy rundown_items_update_acara
  on public.rundown_items for update to authenticated
  using (public.current_user_role() = 'acara')
  with check (public.current_user_role() = 'acara');

drop policy if exists rundown_items_delete_acara on public.rundown_items;
create policy rundown_items_delete_acara
  on public.rundown_items for delete to authenticated
  using (public.current_user_role() = 'acara');
