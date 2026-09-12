-- ============================================================
-- Creatopz — Migration 005: lock the sole admin account
-- Safe to run on your LIVE project. Run AFTER schema.sql,
-- migration_002, migration_003, migration_004.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Only creatopz.in@gmail.com may ever hold role = 'admin'.
--    This replaces the plain is_admin()-only guard from
--    migration_002 with an email allowlist enforced in the
--    database itself — not just "only an admin can promote".
-- ------------------------------------------------------------
create or replace function prevent_role_self_change() returns trigger as $$
begin
  if new.role is distinct from old.role then
    if not is_admin() then
      raise exception 'Only an admin can change a user role.';
    end if;
    if new.role = 'admin' and new.email is distinct from 'creatopz.in@gmail.com' then
      raise exception 'Only creatopz.in@gmail.com may hold the admin role.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;
-- (trigger trg_prevent_role_change from migration_002 already points at
-- this function name, so it picks up the new body automatically.)

-- ------------------------------------------------------------
-- 2. Also guard INSERT — a new profiles row must not be able to
--    insert itself as admin unless it is that one email.
-- ------------------------------------------------------------
create or replace function prevent_admin_self_insert() returns trigger as $$
begin
  if new.role = 'admin' and new.email is distinct from 'creatopz.in@gmail.com' then
    raise exception 'Only creatopz.in@gmail.com may hold the admin role.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_prevent_admin_self_insert on profiles;
create trigger trg_prevent_admin_self_insert
  before insert on profiles
  for each row execute function prevent_admin_self_insert();

-- ------------------------------------------------------------
-- 3. One-time backfill: if creatopz.in@gmail.com has already
--    signed up, promote that profile now. If they haven't
--    signed up yet, sign up normally first, then re-run just
--    this block.
-- ------------------------------------------------------------
update profiles set role = 'admin'
where email = 'creatopz.in@gmail.com' and role is distinct from 'admin';

-- ------------------------------------------------------------
-- 4. Belt-and-braces: revoke any accidental admin role from
--    every other account. Run this any time you want to audit.
-- ------------------------------------------------------------
update profiles set role = 'creator'
where role = 'admin' and email is distinct from 'creatopz.in@gmail.com';

-- ============================================================
-- After running this file:
--   - No signup flow, client-side call, or DevTools edit can ever
--     set role='admin' on any account except creatopz.in@gmail.com.
--   - If that account doesn't exist yet: go sign up normally on
--     /auth.html with creatopz.in@gmail.com, then re-run step 3 above.
-- ============================================================
