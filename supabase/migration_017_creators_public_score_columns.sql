-- Migration 017: expose the Creatopz Score on public creator profiles.
-- Additive only -- adds two columns to an existing view's SELECT list,
-- removes/renames nothing. Without this, a creator's score only showed
-- correctly on their OWN profile view (which reads the base `creators`
-- table directly); anyone viewing another creator's *public* profile
-- reads this view instead, and it predated migration_016's
-- creatopz_score/ratings_count columns.
create or replace view public.creators_public as
select
  id,
  name,
  username,
  bio,
  category,
  profile_image,
  followers,
  engagement_rate,
  brand_partnerships,
  age_range,
  gender,
  locations,
  audience_locations,
  audience_age_ranges,
  audience_gender,
  languages,
  content_types,
  availability,
  is_public,
  is_verified,
  created_at,
  audience_female_pct,
  audience_male_pct,
  creatopz_score,
  ratings_count
from creators
where is_public = true;
