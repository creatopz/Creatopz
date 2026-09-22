-- Migration 027: let admin hide an individual campaign from the public
-- campaigns.html listings (live grid via campaigns_public, past grid via
-- campaigns_public_history) without touching its real status -- a
-- campaign can still be open/closed/completed and fully functional for
-- its brand/applicants while simply not shown on the public page. Additive
-- column, defaulted true so every existing campaign keeps showing exactly
-- as it does today.

alter table public.campaigns add column if not exists is_public_listed boolean not null default true;

create or replace view public.campaigns_public as
select id, brand_id, title, description, brief, niche, platforms, deadline, location, requirements, status, created_at,
       budget_min, budget_max
from campaigns
where status = 'open' and is_public_listed = true;

create or replace view public.campaigns_public_history as
select id, brand_id, title, description, brief, niche, platforms, deadline, location, requirements, status, created_at,
       budget_min, budget_max
from campaigns
where status in ('closed', 'completed') and is_public_listed = true;

-- Re-applying migration_024's read-only lock-down -- CREATE OR REPLACE
-- VIEW does not reset existing grants/revokes, but this keeps both
-- migrations self-contained and safe to re-run independently.
grant select on public.campaigns_public to anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.campaigns_public from anon, authenticated;

grant select on public.campaigns_public_history to anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.campaigns_public_history from anon, authenticated;
