-- Migration 012: fix creators being unable to apply to any campaign at
-- all, close a live PII-exposure hole on profiles + legacy tables, and
-- back real "invite to a brief" / "shortlist" features.

-- ============================================================
-- 1. Fix: creators could never actually apply to a campaign.
--
-- "applications: creator can apply"'s with_check subqueried
-- campaigns directly (campaign_id IN (SELECT id FROM campaigns
-- WHERE status='open')), but that subquery runs under the
-- CURRENT ROLE's own SELECT permissions on campaigns -- and no
-- campaigns SELECT policy grants a not-yet-applied creator read
-- access to an open campaign. So the subquery always evaluated
-- to empty and the insert was always refused, for every creator,
-- on every campaign, always. Mirrors the existing
-- creator_has_applied_to_campaign() SECURITY DEFINER pattern
-- (migration_010) so the open-check runs with definer privileges
-- instead of the calling creator's own (intentionally narrow)
-- row access.
-- ============================================================
create or replace function public.is_campaign_open(p_campaign_id uuid)
returns boolean
language sql
stable security definer
set search_path to 'public', 'pg_temp'
as $$
  select exists (
    select 1 from campaigns c
    where c.id = p_campaign_id and c.status = 'open'
  );
$$;

drop policy if exists "applications: creator can apply" on public.campaign_applications;
create policy "applications: creator can apply" on public.campaign_applications
  for insert
  with check (
    creator_id in (select id from creators where user_id = auth.uid())
    and public.is_campaign_open(campaign_id)
  );

-- ============================================================
-- 2. Real "Invite to a brief": a brand can create an application
-- row inviting a specific creator to one of its own open
-- campaigns. 'invited' is a new status so the creator's
-- dashboard can tell "I applied" apart from "a brand invited me".
-- ============================================================
alter table public.campaign_applications drop constraint if exists campaign_applications_status_check;
alter table public.campaign_applications add constraint campaign_applications_status_check
  check (status = any (array['pending','shortlisted','accepted','rejected','withdrawn','invited']));

create policy "applications: brand can invite creator to own open campaign" on public.campaign_applications
  for insert
  with check (
    status = 'invited'
    and campaign_id in (
      select c.id from campaigns c
      join brands b on b.id = c.brand_id
      where b.user_id = auth.uid() and c.status = 'open'
    )
  );

-- ============================================================
-- 3. Real, persisted "shortlist" of creators a brand is
-- considering, independent of any single campaign's applicant
-- list (that per-campaign shortlist already worked via
-- campaign_applications.status='shortlisted' -- this is a
-- separate "save this creator for later" bookmark, wired up on
-- profile.html and dashboard-brand.html).
-- ============================================================
create table if not exists public.brand_shortlists (
  id uuid primary key default extensions.uuid_generate_v4(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (brand_id, creator_id)
);
alter table public.brand_shortlists enable row level security;

create policy "brand_shortlists: brand can read own" on public.brand_shortlists
  for select using (brand_id in (select id from brands where user_id = auth.uid()) or is_admin());
create policy "brand_shortlists: brand can add own" on public.brand_shortlists
  for insert with check (brand_id in (select id from brands where user_id = auth.uid()));
create policy "brand_shortlists: brand can remove own" on public.brand_shortlists
  for delete using (brand_id in (select id from brands where user_id = auth.uid()));

-- ============================================================
-- 4. Live PII leak found while auditing the above: "profiles are
-- viewable by everyone" (qual true) coexisted with the intended
-- owner-or-admin-only policy. Postgres OR-combines multiple
-- permissive policies for the same command, so this extra
-- permissive policy let any signed-in user read every other
-- user's email/full_name/phone. No app code relies on reading
-- another user's profiles row (every .from("profiles") call in
-- the codebase filters by the caller's own id), so dropping it
-- changes no behavior. Also drops the redundant duplicate "users
-- can update own profile" policy (qual auth.uid()=id, no
-- with_check), superseded by "profiles: user can update own,
-- never role" (same qual, plus a with_check that blocks
-- self-promotion to admin).
-- ============================================================
drop policy if exists "profiles are viewable by everyone" on public.profiles;
drop policy if exists "users can update own profile" on public.profiles;

-- ============================================================
-- 5. Same wide-open "viewable by everyone" (qual true) pattern
-- on three dead legacy-backup tables predating the current
-- schema. Nothing in the app reads these tables. Dropping the
-- exposure policy leaves the tables and their data untouched --
-- RLS enabled with no SELECT policy means default-deny.
-- ============================================================
drop policy if exists "campaigns are viewable by everyone" on public.campaigns_legacy_backup;
drop policy if exists "brand profiles are viewable by everyone" on public.brand_profiles_legacy_backup;
drop policy if exists "creator profiles are viewable by everyone" on public.creator_profiles_legacy_backup;
