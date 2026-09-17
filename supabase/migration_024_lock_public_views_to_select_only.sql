-- Migration 024: CRITICAL FIX -- every "safe public view" in this schema
-- (creators_public, campaigns_public, brands_public,
-- creator_spotlights_public, niche_earnings_stats) had default INSERT/
-- UPDATE/DELETE/TRUNCATE grants to anon and authenticated, in addition to
-- SELECT. Since these are simple single-table views with no
-- security_invoker set, Postgres treats them as automatically updatable
-- and rewrites a write against the view into a real write against the
-- underlying base table, executed as the view owner -- which bypasses
-- the base table's own RLS policies entirely (the view's WHERE clause,
-- e.g. is_public = true, is the only thing that still filters rows).
--
-- Verified exploitable against production before this fix: an anonymous
-- request could UPDATE any public creator's row through creators_public
-- with none of the "own row only" RLS on `creators` ever evaluated.
-- (One test write was accidentally committed against a real creator's
-- bio during verification and was immediately reverted by hand to its
-- original value before this migration was written.)
--
-- This is specific to VIEWS without RLS of their own -- regular tables
-- with RLS enabled (e.g. `leads`, `agent_reports`) are unaffected by the
-- same broad default grant, since RLS is enforced directly on those
-- regardless of GRANT breadth; verified separately.

revoke insert, update, delete, truncate, references, trigger
  on public.creators_public from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.campaigns_public from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.brands_public from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.creator_spotlights_public from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.niche_earnings_stats from anon, authenticated;
