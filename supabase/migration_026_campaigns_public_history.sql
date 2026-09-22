-- Migration 026: a public "past campaigns" view for campaigns.html's
-- track-record section (closed/completed campaigns only).
--
-- campaigns_public is deliberately `where status = 'open'` (migration
-- 022) and several pages rely on that filter implicitly -- js/campaigns.js's
-- own loadCampaigns(), dashboard-creator.html's Browse Campaigns tab, and
-- brand-profile.html's live-briefs list all select from it with no
-- client-side status filter of their own, trusting the view to only ever
-- return open rows. Widening campaigns_public itself would silently start
-- showing closed campaigns as if they were still appliable everywhere
-- else. A separate view keeps that contract intact and is purely additive.
create or replace view public.campaigns_public_history as
select id, brand_id, title, description, brief, niche, platforms, deadline, location, requirements, status, created_at,
       budget_min, budget_max
from campaigns
where status in ('closed', 'completed');

grant select on public.campaigns_public_history to anon, authenticated;

-- Same lock-down as migration_024's other public views: a safe explicit
-- column allowlist for reads only, never a write surface.
revoke insert, update, delete, truncate, references, trigger
  on public.campaigns_public_history from anon, authenticated;
