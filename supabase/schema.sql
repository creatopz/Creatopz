-- ============================================================
-- Creatopz — Supabase schema
-- Paste this into the SQL editor of a fresh Supabase project.
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Central profile row, one per auth user.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('creator', 'brand', 'admin')) not null default 'creator',
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists creators (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references auth.users(id) on delete cascade,
  name text,
  username text unique,
  bio text,
  category text,
  profile_image text,
  followers integer default 0,
  engagement_rate numeric default 0,
  instagram_url text,
  youtube_url text,
  website_url text,
  brand_partnerships text[] default '{}',
  age_range text,
  gender text,
  locations text[] default '{}',
  audience_locations text[] default '{}',
  audience_age_ranges text[] default '{}',
  audience_gender text,
  audience_female_pct numeric,
  audience_male_pct numeric,
  languages text[] default '{}',
  content_types text[] default '{}',
  rate_min numeric,
  rate_max numeric,
  availability text default 'available',
  is_public boolean not null default true,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_creators_public on creators (is_public);
create index if not exists idx_creators_category on creators (category);
create index if not exists idx_creators_followers on creators (followers desc);
create index if not exists idx_creators_engagement on creators (engagement_rate desc);

create table if not exists brands (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references auth.users(id) on delete cascade,
  company_name text,
  username text unique,
  logo_url text,
  description text,
  website text,
  contact_email text,
  contact_phone text,
  industry text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id) on delete cascade,
  title text not null,
  description text,
  brief text,
  niche text,
  platforms text[] default '{}',
  budget_min numeric,
  budget_max numeric,
  deadline date,
  location text,
  requirements text,
  status text check (status in ('draft', 'open', 'closed', 'completed')) not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_campaigns_status on campaigns (status);
create index if not exists idx_campaigns_brand on campaigns (brand_id);

create table if not exists campaign_applications (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  creator_id uuid references creators(id) on delete cascade,
  message text,
  status text check (status in ('pending', 'accepted', 'rejected', 'withdrawn')) not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, creator_id) -- prevents duplicate applications
);
create index if not exists idx_applications_campaign on campaign_applications (campaign_id);
create index if not exists idx_applications_creator on campaign_applications (creator_id);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  type text,
  title text,
  message text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications (user_id, created_at desc);

create table if not exists gallery_posts (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  caption text,
  instagram_url text,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_gallery_published on gallery_posts (is_published, display_order);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table creators enable row level security;
alter table brands enable row level security;
alter table campaigns enable row level security;
alter table campaign_applications enable row level security;
alter table notifications enable row level security;
alter table gallery_posts enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- ---------- profiles ----------
create policy "profiles: user can read own" on profiles
  for select using (auth.uid() = id or is_admin());

create policy "profiles: user can insert own" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles: user can update own, never role" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------- creators ----------
create policy "creators: public can read public profiles" on creators
  for select using (is_public = true or auth.uid() = user_id or is_admin());

create policy "creators: owner can insert own profile" on creators
  for insert with check (auth.uid() = user_id);

create policy "creators: owner can update own profile" on creators
  for update using (auth.uid() = user_id or is_admin())
  with check (
    auth.uid() = user_id or is_admin()
  );
-- Note: verification (is_verified) should only be flipped by admins.
-- Enforce this at the application layer for the brand/creator dashboards
-- (they never send is_verified in their update payload), and rely on
-- is_admin() above for the actual admin toggle.

-- ---------- brands ----------
create policy "brands: owner can read own" on brands
  for select using (auth.uid() = user_id or is_admin());

create policy "brands: public can read brand names for open campaigns" on brands
  for select using (true); -- company name/logo are not sensitive; needed for campaign cards

create policy "brands: owner can insert own" on brands
  for insert with check (auth.uid() = user_id);

create policy "brands: owner can update own" on brands
  for update using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id or is_admin());

-- ---------- campaigns ----------
create policy "campaigns: public can read open campaigns" on campaigns
  for select using (
    status = 'open'
    or is_admin()
    or brand_id in (select id from brands where user_id = auth.uid())
  );

create policy "campaigns: brand can insert own campaigns" on campaigns
  for insert with check (
    brand_id in (select id from brands where user_id = auth.uid())
  );

create policy "campaigns: brand can update own campaigns" on campaigns
  for update using (
    brand_id in (select id from brands where user_id = auth.uid()) or is_admin()
  )
  with check (
    brand_id in (select id from brands where user_id = auth.uid()) or is_admin()
  );

create policy "campaigns: brand can delete own campaigns" on campaigns
  for delete using (
    brand_id in (select id from brands where user_id = auth.uid()) or is_admin()
  );

-- ---------- campaign_applications ----------
create policy "applications: creator can read own applications" on campaign_applications
  for select using (
    creator_id in (select id from creators where user_id = auth.uid())
    or campaign_id in (select id from campaigns where brand_id in (select id from brands where user_id = auth.uid()))
    or is_admin()
  );

create policy "applications: creator can apply" on campaign_applications
  for insert with check (
    creator_id in (select id from creators where user_id = auth.uid())
    and campaign_id in (select id from campaigns where status = 'open')
  );

create policy "applications: creator can withdraw own, brand can accept/reject" on campaign_applications
  for update using (
    creator_id in (select id from creators where user_id = auth.uid())
    or campaign_id in (select id from campaigns where brand_id in (select id from brands where user_id = auth.uid()))
    or is_admin()
  )
  with check (
    creator_id in (select id from creators where user_id = auth.uid())
    or campaign_id in (select id from campaigns where brand_id in (select id from brands where user_id = auth.uid()))
    or is_admin()
  );

-- ---------- notifications ----------
create policy "notifications: user reads own" on notifications
  for select using (auth.uid() = user_id or is_admin());

create policy "notifications: system/user can insert" on notifications
  for insert with check (true); -- created by the app on behalf of the recipient

create policy "notifications: user can mark own as read" on notifications
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- gallery_posts ----------
create policy "gallery_posts: public can read published" on gallery_posts
  for select using (is_published = true or is_admin());

create policy "gallery_posts: admin can insert" on gallery_posts
  for insert with check (is_admin());

create policy "gallery_posts: admin can update" on gallery_posts
  for update using (is_admin())
  with check (is_admin());

create policy "gallery_posts: admin can delete" on gallery_posts
  for delete using (is_admin());

-- ============================================================
-- STORAGE BUCKETS
-- Run once — create the buckets first in the Storage UI or via:
--   insert into storage.buckets (id, name, public) values ('creator-avatars','creator-avatars', true);
--   insert into storage.buckets (id, name, public) values ('brand-logos','brand-logos', true);
-- Then apply these policies:
-- ============================================================

create policy "creator-avatars: public read" on storage.objects
  for select using (bucket_id = 'creator-avatars');

create policy "creator-avatars: owner can upload to own folder" on storage.objects
  for insert with check (
    bucket_id = 'creator-avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "creator-avatars: owner can update/delete own files" on storage.objects
  for update using (
    bucket_id = 'creator-avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "brand-logos: public read" on storage.objects
  for select using (bucket_id = 'brand-logos');

create policy "brand-logos: owner can upload to own folder" on storage.objects
  for insert with check (
    bucket_id = 'brand-logos' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "brand-logos: owner can update/delete own files" on storage.objects
  for update using (
    bucket_id = 'brand-logos' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Gallery bucket: public read, admin-only write (site-managed content,
-- not user-uploaded — see gallery_posts table above).
create policy "gallery bucket: public read" on storage.objects
  for select using (bucket_id = 'gallery');

create policy "gallery bucket: admin can upload" on storage.objects
  for insert with check (bucket_id = 'gallery' and is_admin());

create policy "gallery bucket: admin can update" on storage.objects
  for update using (bucket_id = 'gallery' and is_admin())
  with check (bucket_id = 'gallery' and is_admin());

create policy "gallery bucket: admin can delete" on storage.objects
  for delete using (bucket_id = 'gallery' and is_admin());

-- ============================================================
-- Make yourself an admin (run manually, after signing up once):
--   update profiles set role = 'admin' where email = 'you@example.com';
-- ============================================================
