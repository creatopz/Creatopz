-- ============================================================
-- Creatopz — DEVELOPMENT / DEMO seed data only.
-- Do NOT run this against production. It inserts fake rows
-- directly (bypassing auth.users), which is fine for local
-- testing of the public directory and campaign feed, but these
-- rows have no real login and should be deleted before launch.
-- ============================================================

-- Fake creators (no linked auth user — fine for read-only directory testing)
insert into creators (id, name, username, bio, category, followers, engagement_rate, locations, content_types, is_public, is_verified)
values
  (uuid_generate_v4(), 'Chahat Sharma', 'chahat.creates', 'Beauty & lifestyle creator based in Jodhpur.', 'Beauty', 19800, 5.6, array['Jodhpur','Jaipur'], array['Reels','Stories'], true, true),
  (uuid_generate_v4(), 'Sangeeta Suthar', 'sangeeta.style', 'Fashion and everyday style inspiration.', 'Fashion & Style', 18500, 6.4, array['Jodhpur'], array['Reels','Static posts'], true, false),
  (uuid_generate_v4(), 'Kavita Rathore', 'kavita.ugc', 'UGC and modeling for D2C brands.', 'Other', 9200, 4.1, array['Jodhpur','Udaipur'], array['UGC videos','Static posts'], true, false)
on conflict do nothing;

-- Note: creating fake brands/campaigns/applications tied to real
-- workflows requires real auth.users rows (for the foreign keys on
-- user_id), so those are best created by signing up test accounts
-- through the app itself rather than seeded here.
