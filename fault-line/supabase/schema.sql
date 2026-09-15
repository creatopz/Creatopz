-- ============================================================================
-- FAULT LINE — Supabase schema
-- Run this once in the SQL Editor of a fresh Supabase project.
-- Idempotent-ish: safe to re-run on a project that already has it (uses
-- IF NOT EXISTS / CREATE OR REPLACE everywhere it can).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- PROFILES
-- One row per auth.users row. Contains ONLY public-safe fields by design —
-- there is no email, no real name, nothing private in here. Real identity
-- lives exclusively in auth.users, which the client never queries directly.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  anonymous_username text unique not null check (char_length(anonymous_username) between 3 and 24),
  avatar_config jsonb not null default '{}'::jsonb,
  avatar_expression text not null default 'neutral',
  bio text check (char_length(bio) <= 280),
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  status text not null default 'active' check (status in ('active', 'warned', 'suspended', 'banned')),
  match_tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Public, anonymous identity. Never store email/real name here.';

-- ----------------------------------------------------------------------------
-- FAULT ZONES
-- ----------------------------------------------------------------------------
create table if not exists public.fault_zones (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  theme text not null default 'ink' check (theme in ('ink', 'red', 'blue', 'acid')),
  is_featured boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.zone_members (
  zone_id uuid not null references public.fault_zones(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (zone_id, user_id)
);

-- ----------------------------------------------------------------------------
-- POSTS / REACTIONS / COMMENTS
-- ----------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  emotional_tags text[] not null default '{}',
  zone_id uuid references public.fault_zones(id) on delete set null,
  visibility text not null default 'public' check (visibility in ('public', 'zone_only')),
  is_hidden boolean not null default false,
  hidden_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_idx on public.posts (author_id);
create index if not exists posts_zone_idx on public.posts (zone_id);
create index if not exists posts_tags_idx on public.posts using gin (emotional_tags);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('me_too', 'felt_that', 'ouch', 'hug')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id, kind)
);

create index if not exists reactions_post_idx on public.reactions (post_id);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 800),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_idx on public.comments (post_id);

-- ----------------------------------------------------------------------------
-- PERSONALITY MATCHING
-- ----------------------------------------------------------------------------
create table if not exists public.personality_questions (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  order_index int not null default 0
);

create table if not exists public.personality_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.personality_questions(id) on delete cascade,
  answer text not null,
  created_at timestamptz not null default now(),
  unique (user_id, question_id)
);

-- ----------------------------------------------------------------------------
-- SUBSCRIPTIONS (Razorpay)
-- Rows here are only ever written by the server (service role), never
-- directly by the client — see /api/payments/*. Clients can only SELECT
-- their own row.
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly', 'lifetime')),
  status text not null default 'pending' check (status in ('pending', 'active', 'expired', 'cancelled', 'failed')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  amount_paise int not null,
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);

-- ----------------------------------------------------------------------------
-- SAFETY / MODERATION
-- ----------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id)
);

create index if not exists reports_status_idx on public.reports (status);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  action_type text not null,
  target_type text not null,
  target_id uuid,
  notes text,
  created_at timestamptz not null default now()
);

-- rudimentary rate limiting: one row per (user, day) counting posts
create table if not exists public.post_rate_limits (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null default current_date,
  post_count int not null default 0,
  primary key (user_id, day)
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role in ('admin', 'moderator')
  );
$$;

-- keeps role/status locked down to admins even if a client somehow tries
-- to smuggle a change through an otherwise-permitted profile update.
-- The service_role Postgres role (used only by the server's admin client,
-- gated by requireAdmin() in the app) already bypasses RLS entirely, so it
-- also bypasses this trigger — anything reaching this function as anything
-- other than service_role must prove is_admin(auth.uid()) instead.
create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'service_role' then
    return new;
  end if;
  if not public.is_admin(auth.uid()) then
    new.role := old.role;
    new.status := old.status;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_columns on public.profiles;
create trigger trg_protect_profile_columns
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
  before update on public.posts
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.fault_zones enable row level security;
alter table public.zone_members enable row level security;
alter table public.posts enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.personality_questions enable row level security;
alter table public.personality_answers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.reports enable row level security;
alter table public.admin_actions enable row level security;
alter table public.post_rate_limits enable row level security;

-- profiles: public-safe by construction, so anyone may read; only the
-- owner (or an admin) may write, and role/status are trigger-protected.
drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable" on public.profiles
  for select using (true);

drop policy if exists "user creates own profile" on public.profiles;
create policy "user creates own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "user updates own profile" on public.profiles;
create policy "user updates own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin(auth.uid()));

-- fault zones: readable by everyone; only admins manage them
drop policy if exists "zones are publicly readable" on public.fault_zones;
create policy "zones are publicly readable" on public.fault_zones
  for select using (is_archived = false or public.is_admin(auth.uid()));

drop policy if exists "admins manage zones" on public.fault_zones;
create policy "admins manage zones" on public.fault_zones
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- zone members
drop policy if exists "memberships are publicly readable" on public.zone_members;
create policy "memberships are publicly readable" on public.zone_members
  for select using (true);

drop policy if exists "user joins zone" on public.zone_members;
create policy "user joins zone" on public.zone_members
  for insert with check (auth.uid() = user_id);

drop policy if exists "user leaves zone" on public.zone_members;
create policy "user leaves zone" on public.zone_members
  for delete using (auth.uid() = user_id);

-- posts: any non-hidden post is readable by anyone — `visibility` only
-- decides whether a post shows in the cross-zone global feed (the app
-- filters for that), not whether it's accessible; hidden posts are
-- readable only by their author or an admin/moderator
drop policy if exists "posts are readable" on public.posts;
create policy "posts are readable" on public.posts
  for select using (
    is_hidden = false
    or auth.uid() = author_id
    or public.is_admin(auth.uid())
  );

drop policy if exists "user creates own post" on public.posts;
create policy "user creates own post" on public.posts
  for insert with check (auth.uid() = author_id);

drop policy if exists "user edits own post" on public.posts;
create policy "user edits own post" on public.posts
  for update using (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists "user deletes own post" on public.posts;
create policy "user deletes own post" on public.posts
  for delete using (auth.uid() = author_id or public.is_admin(auth.uid()));

-- reactions: visible to everyone, only the owner can add/remove theirs
drop policy if exists "reactions are publicly readable" on public.reactions;
create policy "reactions are publicly readable" on public.reactions
  for select using (true);

drop policy if exists "user adds own reaction" on public.reactions;
create policy "user adds own reaction" on public.reactions
  for insert with check (auth.uid() = user_id);

drop policy if exists "user removes own reaction" on public.reactions;
create policy "user removes own reaction" on public.reactions
  for delete using (auth.uid() = user_id);

-- comments
drop policy if exists "comments are readable" on public.comments;
create policy "comments are readable" on public.comments
  for select using (is_hidden = false or auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists "user creates own comment" on public.comments;
create policy "user creates own comment" on public.comments
  for insert with check (auth.uid() = author_id);

drop policy if exists "user manages own comment" on public.comments;
create policy "user manages own comment" on public.comments
  for update using (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists "user deletes own comment" on public.comments;
create policy "user deletes own comment" on public.comments
  for delete using (auth.uid() = author_id or public.is_admin(auth.uid()));

-- personality questions: readable by anyone signed in
drop policy if exists "questions are readable" on public.personality_questions;
create policy "questions are readable" on public.personality_questions
  for select using (true);

-- personality answers: strictly private to the owner (+ admin for safety review)
drop policy if exists "user reads own answers" on public.personality_answers;
create policy "user reads own answers" on public.personality_answers
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "user writes own answers" on public.personality_answers;
create policy "user writes own answers" on public.personality_answers
  for insert with check (auth.uid() = user_id);

drop policy if exists "user updates own answers" on public.personality_answers;
create policy "user updates own answers" on public.personality_answers
  for update using (auth.uid() = user_id);

-- subscriptions: user may only ever read their own row; all writes happen
-- server-side via the service role (order creation + webhook), never
-- directly from the client
drop policy if exists "user reads own subscription" on public.subscriptions;
create policy "user reads own subscription" on public.subscriptions
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- reports: anyone signed in can file one; only the reporter or an admin
-- can see it
drop policy if exists "user files report" on public.reports;
create policy "user files report" on public.reports
  for insert with check (auth.uid() = reporter_id);

drop policy if exists "reports readable by reporter or admin" on public.reports;
create policy "reports readable by reporter or admin" on public.reports
  for select using (auth.uid() = reporter_id or public.is_admin(auth.uid()));

drop policy if exists "admin updates report" on public.reports;
create policy "admin updates report" on public.reports
  for update using (public.is_admin(auth.uid()));

-- admin_actions: admin-only, both ways
drop policy if exists "admin reads action log" on public.admin_actions;
create policy "admin reads action log" on public.admin_actions
  for select using (public.is_admin(auth.uid()));

drop policy if exists "admin writes action log" on public.admin_actions;
create policy "admin writes action log" on public.admin_actions
  for insert with check (public.is_admin(auth.uid()));

-- rate limits: user can read their own counter; only server (service role,
-- bypasses RLS) increments it
drop policy if exists "user reads own rate limit" on public.post_rate_limits;
create policy "user reads own rate limit" on public.post_rate_limits
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- ============================================================================
-- Realtime (optional): let the feed subscribe to new posts/reactions
-- ============================================================================
-- Run this manually if you want live updates:
-- alter publication supabase_realtime add table public.posts;
-- alter publication supabase_realtime add table public.reactions;
