-- Migration 014: two low-risk cleanups found during a full function/RLS
-- audit (Supabase advisors + manual review of every RPC function's
-- grants and body), not something a user reported.

-- 1. These five functions only ever run as BEFORE INSERT/UPDATE trigger
-- bodies; none of them are referenced inside any RLS policy. Postgres
-- fires triggers regardless of the invoking role's EXECUTE grant on the
-- trigger function (that grant only matters for a role calling the
-- function directly, e.g. via PostgREST's /rest/v1/rpc/<fn>), so
-- revoking direct EXECUTE here closes an unintended public RPC surface
-- without touching how any trigger fires.
-- (is_admin/is_campaign_open/creator_has_applied_to_campaign are NOT
-- included here on purpose -- they're called from inside RLS policy
-- bodies, which run as the querying role, so revoking EXECUTE on those
-- would break every policy that uses them. get_campaign_applicants was
-- checked too: it's SECURITY DEFINER but starts with an explicit
-- `is_admin() OR caller owns this campaign` check and raises otherwise
-- -- correctly guarded, left as-is.)
revoke execute on function public.enforce_campaign_posting_control() from anon, authenticated;
revoke execute on function public.flag_suspicious_creator_stats() from anon, authenticated;
revoke execute on function public.prevent_creator_self_verify() from anon, authenticated;
revoke execute on function public.prevent_rapid_duplicate_campaign() from anon, authenticated;
revoke execute on function public.sync_creator_rate_range() from anon, authenticated;

-- 2. Missing covering indexes on creator_id for the two tables added
-- in the rate-card/team-builder work (migration_012/013) -- both are
-- joined/filtered by creator_id on every read (admin's planned-roster
-- view, a brand's own team picks, a creator's shortlisted-by lookups).
create index if not exists idx_campaign_team_picks_creator_id on public.campaign_team_picks(creator_id);
create index if not exists idx_brand_shortlists_creator_id on public.brand_shortlists(creator_id);
