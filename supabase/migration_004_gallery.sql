-- ============================================================
-- Creatopz — Migration 004: Admin-managed Instagram-style gallery
-- Safe to run on your LIVE project. Purely additive.
-- Paste into Supabase SQL Editor and run once (already applied
-- to the live project as of this file being added).
-- ============================================================

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

alter table gallery_posts enable row level security;

create policy "gallery_posts: public can read published" on gallery_posts
  for select using (is_published = true or is_admin());

create policy "gallery_posts: admin can insert" on gallery_posts
  for insert with check (is_admin());

create policy "gallery_posts: admin can update" on gallery_posts
  for update using (is_admin())
  with check (is_admin());

create policy "gallery_posts: admin can delete" on gallery_posts
  for delete using (is_admin());

-- Storage bucket for gallery images. Create it in the Storage UI as
-- "gallery" (public) if this insert doesn't work on your plan, then
-- just run the three policies below.
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "gallery bucket: public read" on storage.objects
  for select using (bucket_id = 'gallery');

create policy "gallery bucket: admin can upload" on storage.objects
  for insert with check (bucket_id = 'gallery' and is_admin());

create policy "gallery bucket: admin can update" on storage.objects
  for update using (bucket_id = 'gallery' and is_admin())
  with check (bucket_id = 'gallery' and is_admin());

create policy "gallery bucket: admin can delete" on storage.objects
  for delete using (bucket_id = 'gallery' and is_admin());
