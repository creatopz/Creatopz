-- Migration 020: Phase 3 (part 2) -- Rate transparency.
-- One new aggregate-only view. No new table, nothing existing touched.
-- The 5-creator minimum is enforced in the view itself via HAVING, so
-- there is no code path that can accidentally publish a too-small
-- sample, and no individual creator's data is ever exposed -- only a
-- per-niche/per-month average and a creator count.
create view public.niche_earnings_stats as
select
  c.niche as category,
  date_trunc('month', ca.updated_at)::date as month,
  avg(ca.agreed_budget) as avg_budget,
  count(distinct ca.creator_id) as creator_count
from campaign_applications ca
join campaigns c on c.id = ca.campaign_id
where ca.status in ('accepted', 'completed')
  and ca.agreed_budget is not null
group by c.niche, date_trunc('month', ca.updated_at)
having count(distinct ca.creator_id) >= 5;
