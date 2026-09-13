-- Migration 019: Phase 3 (part 1) -- Referral -> priority access.
-- Additive columns + one trigger; one existing view's WHERE clause
-- gains a priority-access carve-out (disclosed in the approved plan
-- as the one place this phase touches existing view logic).

alter table public.creators add column if not exists referral_code text unique;
alter table public.creators add column if not exists referred_by_creator_id uuid references public.creators(id);
alter table public.creators add column if not exists priority_access boolean not null default false;

-- Auto-generate a short unique code for every creator so no UI change
-- is needed to backfill existing rows.
create or replace function public.set_creator_referral_code()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $$
declare
  candidate text;
  attempt int := 0;
begin
  if new.referral_code is not null then
    return new;
  end if;
  loop
    candidate := substr(md5(random()::text || clock_timestamp()::text), 1, 8);
    attempt := attempt + 1;
    exit when attempt > 5 or not exists (select 1 from creators where referral_code = candidate);
  end loop;
  new.referral_code := candidate;
  return new;
end;
$$;

create trigger trg_set_creator_referral_code
  before insert on public.creators
  for each row execute function public.set_creator_referral_code();

-- One-time backfill for existing creators (created before this trigger existed).
update public.creators
set referral_code = substr(md5(random()::text || clock_timestamp()::text || id::text), 1, 8)
where referral_code is null;

-- campaigns_public: a priority creator (referrer or referred, while
-- their cohort is forming) sees a new brief immediately; everyone else
-- sees it 24 hours after it's posted. Also adds budget_min/budget_max
-- to the column list -- campaigns.html's own formatBudget() ignores
-- its arguments and always shows "discussed via Creatopz" regardless,
-- so this is inert there; briefs.html (Phase 3 part 3) is the first
-- consumer that actually reads these two columns.
create or replace view public.campaigns_public as
select id, brand_id, title, description, brief, niche, platforms, deadline, location, requirements, status, created_at,
       budget_min, budget_max
from campaigns
where status = 'open'
  and (
    now() >= created_at + interval '24 hours'
    or exists (
      select 1 from creators cr where cr.user_id = auth.uid() and cr.priority_access = true
    )
  );
