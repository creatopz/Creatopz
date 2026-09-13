-- Migration 013: per-content-type creator rate cards, and a brand-side
-- "build your team" planner that's visible to admin before anyone is
-- invited or applies.

-- ============================================================
-- 1. Creator rate card: one rate per content type instead of a
-- single flat rate, so a brand can mix creators/content types
-- inside one budget. rate_min/rate_max stay as an auto-derived
-- summary (kept in sync by trigger below) so every existing
-- "show a rate range" display (dashboard-brand.html's applicant
-- list, admin-console.html's fmtRange) keeps working untouched.
-- ============================================================
alter table public.creators add column if not exists rate_card jsonb not null default '[]'::jsonb;

create or replace function public.sync_creator_rate_range()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $$
declare
  lo numeric;
  hi numeric;
begin
  select min((elem->>'rate')::numeric), max((elem->>'rate')::numeric)
  into lo, hi
  from jsonb_array_elements(coalesce(new.rate_card, '[]'::jsonb)) elem
  where (elem->>'rate') ~ '^[0-9]+(\.[0-9]+)?$';

  if lo is not null then
    new.rate_min := lo;
    new.rate_max := hi;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_creator_rate_range on public.creators;
create trigger trg_sync_creator_rate_range
  before insert or update of rate_card on public.creators
  for each row execute function public.sync_creator_rate_range();

-- ============================================================
-- 2. A view that lets any signed-in user see a creator's rate
-- card (and the other non-sensitive basics) while planning a
-- campaign team. creators_public deliberately excludes rate --
-- this relaxes only that, for logged-in use, while Instagram
-- handle/URL and direct contact stay admin-mediated as before.
-- Same "plain view over an RLS table, filtered manually" shape
-- as creators_public/campaigns_public -- granted to authenticated
-- only, revoked from anon, so it isn't scraped from the open web.
-- ============================================================
create or replace view public.creators_for_team_builder as
  select id, name, category, profile_image, followers, engagement_rate,
         locations, is_verified, rate_card
  from creators
  where is_public = true and flagged_for_review = false;

revoke all on public.creators_for_team_builder from authenticated, anon;
grant select on public.creators_for_team_builder to authenticated;

-- ============================================================
-- 3. Brand's draft team plan for a campaign: which creators, how
-- much of each content type, at what rate. Visible to the owning
-- brand and admin only -- nothing here reaches a creator, and it
-- is not an application, until admin turns a picked creator into
-- a real invite (below).
-- ============================================================
create table if not exists public.campaign_team_picks (
  id uuid primary key default extensions.uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  content_type text not null,
  quantity integer not null default 1 check (quantity > 0),
  rate_snapshot numeric not null check (rate_snapshot >= 0),
  status text not null default 'planned' check (status in ('planned','approved','dismissed')),
  created_at timestamptz not null default now(),
  unique (campaign_id, creator_id, content_type)
);
alter table public.campaign_team_picks enable row level security;

create policy "team_picks: brand or admin can read" on public.campaign_team_picks
  for select using (
    campaign_id in (select c.id from campaigns c join brands b on b.id = c.brand_id where b.user_id = auth.uid())
    or is_admin()
  );
create policy "team_picks: brand can add own" on public.campaign_team_picks
  for insert with check (
    campaign_id in (select c.id from campaigns c join brands b on b.id = c.brand_id where b.user_id = auth.uid())
  );
create policy "team_picks: brand or admin can update" on public.campaign_team_picks
  for update using (
    campaign_id in (select c.id from campaigns c join brands b on b.id = c.brand_id where b.user_id = auth.uid())
    or is_admin()
  ) with check (
    campaign_id in (select c.id from campaigns c join brands b on b.id = c.brand_id where b.user_id = auth.uid())
    or is_admin()
  );
create policy "team_picks: brand or admin can delete" on public.campaign_team_picks
  for delete using (
    campaign_id in (select c.id from campaigns c join brands b on b.id = c.brand_id where b.user_id = auth.uid())
    or is_admin()
  );

-- ============================================================
-- 4. Structured deliverables snapshot on the real application
-- row, so once admin turns a planned pick into an invite, the
-- exact breakdown (not just a lump agreed_budget) travels with
-- it for the creator and admin to see.
-- ============================================================
alter table public.campaign_applications add column if not exists deliverables jsonb;

-- ============================================================
-- 5. Admin creates the real invite when approving a planned
-- pick -- campaign_applications had no INSERT policy for admin
-- at all (only a creator applying for themself, migration_012's
-- brand-invites-into-own-campaign policy).
-- ============================================================
create policy "applications: admin can create" on public.campaign_applications
  for insert with check (is_admin());
