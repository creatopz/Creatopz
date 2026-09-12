-- ============================================================
-- Creatopz — Migration 003: Audience gender split
-- Safe to run on your LIVE project. Purely additive — only adds
-- two nullable columns to `creators`. Does not touch existing
-- rows, drop anything, or change RLS policies (the existing
-- creators policies already cover all columns on the row).
-- Paste this into Supabase SQL Editor and run it once.
-- ============================================================

alter table creators
  add column if not exists audience_female_pct numeric,
  add column if not exists audience_male_pct numeric;

comment on column creators.audience_female_pct is 'Self-reported % of audience that is female (0-100), optional.';
comment on column creators.audience_male_pct is 'Self-reported % of audience that is male (0-100), optional.';

-- Re-create the public-safe view (from migration 002) to also expose
-- the two new columns. Still excludes contact links and rate fields.
create or replace view creators_public as
select
  id, name, username, bio, category, profile_image,
  followers, engagement_rate, brand_partnerships, age_range, gender,
  locations, audience_locations, audience_age_ranges, audience_gender,
  languages, content_types, availability, is_public, is_verified, created_at,
  audience_female_pct, audience_male_pct
from creators
where is_public = true;

grant select on creators_public to anon, authenticated;
