-- ============================================================
-- Creatopz — Migration 002: Admin-mediated marketplace
-- Safe to run on your LIVE project. Does not drop any tables
-- or delete any rows — only adds/changes rules and columns.
-- Paste this into Supabase SQL Editor and run it once.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Lock the `role` column — only an admin can change it.
--    (Fixes: any user could previously promote themselves to admin.)
-- ------------------------------------------------------------
create or replace function prevent_role_self_change() returns trigger as $$
begin
  if new.role is distinct from old.role and not is_admin() then
    raise exception 'Only an admin can change a user role.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_prevent_role_change on profiles;
create trigger trg_prevent_role_change
  before update on profiles
  for each row execute function prevent_role_self_change();

-- ------------------------------------------------------------
-- 2. Applications get a new 'shortlisted' status, plus columns
--    for the admin to record the real, negotiated deal.
-- ------------------------------------------------------------
alter table campaign_applications drop constraint if exists campaign_applications_status_check;
alter table campaign_applications add constraint campaign_applications_status_check
  check (status in ('pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'));

alter table campaign_applications add column if not exists agreed_budget numeric;
alter table campaign_applications add column if not exists admin_notes text;

-- ------------------------------------------------------------
-- 3. Enforce who can move an application to which status:
--      - creators can only withdraw their own application
--      - brands can only shortlist or reject applicants
--      - only admin can mark 'accepted' (this is the point where
--        Creatopz — not the brand or creator — finalizes the deal)
--      - only admin can set agreed_budget / admin_notes
--    (Fixes: a creator could previously self-accept their own
--    application, skipping the brand and admin entirely.)
-- ------------------------------------------------------------
create or replace function enforce_application_status_transition() returns trigger as $$
declare
  is_creator_owner boolean;
  is_brand_owner boolean;
begin
  if is_admin() then
    return new;
  end if;

  is_creator_owner := old.creator_id in (select id from creators where user_id = auth.uid());
  is_brand_owner := old.campaign_id in (
    select id from campaigns where brand_id in (select id from brands where user_id = auth.uid())
  );

  if new.agreed_budget is distinct from old.agreed_budget
     or new.admin_notes is distinct from old.admin_notes then
    raise exception 'Only Creatopz admin can set the agreed budget or notes.';
  end if;

  if is_creator_owner then
    if new.status is distinct from old.status and new.status != 'withdrawn' then
      raise exception 'Creators can withdraw an application; final acceptance is handled by Creatopz admin.';
    end if;
    return new;
  end if;

  if is_brand_owner then
    if new.status is distinct from old.status and new.status not in ('shortlisted', 'rejected') then
      raise exception 'Brands can shortlist or reject applicants; final acceptance is handled by Creatopz admin.';
    end if;
    return new;
  end if;

  raise exception 'Not authorized to update this application.';
end;
$$ language plpgsql security definer;

drop trigger if exists trg_enforce_application_status on campaign_applications;
create trigger trg_enforce_application_status
  before update on campaign_applications
  for each row execute function enforce_application_status_transition();

-- ------------------------------------------------------------
-- 4. Stop direct/public reads of creators' contact & rate info.
--    Public directory and brand-side applicant views now go
--    through a safe view / function instead of the raw table.
-- ------------------------------------------------------------
drop policy if exists "creators: public can read public profiles" on creators;

create policy "creators: owner or admin can read full profile" on creators
  for select using (auth.uid() = user_id or is_admin());

-- Public-safe view: no instagram_url / youtube_url / website_url / rate_min / rate_max.
create or replace view creators_public as
select
  id, name, username, bio, category, profile_image,
  followers, engagement_rate, brand_partnerships, age_range, gender,
  locations, audience_locations, audience_age_ranges, audience_gender,
  languages, content_types, availability, is_public, is_verified, created_at
from creators
where is_public = true;

grant select on creators_public to anon, authenticated;

-- Server-side function so a brand can see who applied to THEIR campaign,
-- without ever getting the creator's contact links or rate.
create or replace function get_campaign_applicants(p_campaign_id uuid)
returns table (
  application_id uuid,
  status text,
  message text,
  created_at timestamptz,
  creator_id uuid,
  creator_user_id uuid,
  creator_name text,
  creator_username text,
  creator_profile_image text,
  creator_followers integer,
  creator_engagement_rate numeric,
  creator_category text
) as $$
begin
  if not (
    is_admin()
    or p_campaign_id in (select id from campaigns where brand_id in (select id from brands where user_id = auth.uid()))
  ) then
    raise exception 'Not authorized.';
  end if;

  return query
    select
      ca.id, ca.status, ca.message, ca.created_at,
      c.id, c.user_id, c.name, c.username, c.profile_image, c.followers, c.engagement_rate, c.category
    from campaign_applications ca
    join creators c on c.id = ca.creator_id
    where ca.campaign_id = p_campaign_id
    order by ca.created_at desc;
end;
$$ language plpgsql security definer;

grant execute on function get_campaign_applicants(uuid) to authenticated;

-- ------------------------------------------------------------
-- 4b. Same fix on the brand side: stop public/creator reads of
--     brand contact info (contact_email, contact_phone). This
--     policy previously allowed reading EVERY column on brands.
-- ------------------------------------------------------------
drop policy if exists "brands: public can read brand names for open campaigns" on brands;

create or replace view brands_public as
select id, company_name, logo_url, description, industry, location
from brands;

grant select on brands_public to anon, authenticated;

-- ------------------------------------------------------------
-- 5. Stop showing the exact campaign budget to creators/public.
--    Brands still see their own full campaign (with budget);
--    admin always sees everything.
-- ------------------------------------------------------------
drop policy if exists "campaigns: public can read open campaigns" on campaigns;

create policy "campaigns: brand owner or admin can read own campaigns" on campaigns
  for select using (
    is_admin() or brand_id in (select id from brands where user_id = auth.uid())
  );

-- A creator who has applied can still read that specific campaign
-- even after it closes (so their applications list keeps working).
create policy "campaigns: applicant creator can read campaigns they applied to" on campaigns
  for select using (
    id in (
      select campaign_id from campaign_applications
      where creator_id in (select id from creators where user_id = auth.uid())
    )
  );

-- Public-safe view: no budget_min / budget_max.
create or replace view campaigns_public as
select
  id, brand_id, title, description, brief, niche, platforms,
  deadline, location, requirements, status, created_at
from campaigns
where status = 'open';

grant select on campaigns_public to anon, authenticated;

-- ------------------------------------------------------------
-- Done. Nothing above deletes data — existing creators, brands,
-- campaigns and applications are untouched.
-- ============================================================
