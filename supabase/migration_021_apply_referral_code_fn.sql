-- Migration 021: Phase 3 (part 1, continued) -- apply a referral code.
-- A creator can't normally UPDATE another creator's row (needed here
-- to flip the referrer's own priority_access), so this is a narrow
-- SECURITY DEFINER function rather than a broader RLS policy: it only
-- ever touches referred_by_creator_id/priority_access, only when the
-- caller owns target_creator_id (or is admin), and only once per
-- creator (referred_by_creator_id is set once, never overwritten).
create or replace function public.apply_referral_code(target_creator_id uuid, code text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  referrer_id uuid;
begin
  if not (is_admin() or exists (select 1 from creators where id = target_creator_id and user_id = auth.uid())) then
    return false;
  end if;
  select id into referrer_id from creators where referral_code = code;
  if referrer_id is null or referrer_id = target_creator_id then
    return false;
  end if;
  update creators set referred_by_creator_id = referrer_id, priority_access = true
    where id = target_creator_id and referred_by_creator_id is null;
  update creators set priority_access = true where id = referrer_id;
  return true;
end;
$$;
revoke all on function public.apply_referral_code(uuid, text) from public;
grant execute on function public.apply_referral_code(uuid, text) to authenticated;
-- Supabase's default privileges on this schema auto-grant EXECUTE on
-- every new function directly to anon/authenticated/service_role,
-- independent of PUBLIC -- the `revoke ... from public` above doesn't
-- touch that. Confirmed live via pg_proc.proacl and revoked explicitly
-- (same fix already needed once before this session, migration_014).
revoke execute on function public.apply_referral_code(uuid, text) from anon;
