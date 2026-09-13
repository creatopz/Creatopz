-- Migration 022: revert campaigns_public's 24h/priority-access
-- visibility gate from migration_019.
--
-- With zero creators holding priority_access yet (the referral
-- feature just launched, nobody has used a code), that gate hid every
-- newly-approved campaign from every creator for a full 24 hours --
-- discovered live when a just-approved campaign didn't show up
-- anywhere. Reverting to "every open campaign is visible immediately"
-- (how it worked before migration_019). budget_min/budget_max stay in
-- the column list (used by briefs.html; inert on campaigns.html,
-- whose formatBudget() ignores its arguments).
--
-- The referral system itself (creators.referral_code/
-- referred_by_creator_id/priority_access, apply_referral_code()) is
-- untouched and still fully functional -- only this view's visibility
-- gate is reverted. A future "priority access" perk should be
-- something narrower (e.g. an early-access window measured in an hour
-- or two, or a sort-order/badge boost) rather than hiding content from
-- every non-priority creator by default.
create or replace view public.campaigns_public as
select id, brand_id, title, description, brief, niche, platforms, deadline, location, requirements, status, created_at,
       budget_min, budget_max
from campaigns
where status = 'open';
