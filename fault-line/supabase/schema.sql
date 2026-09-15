-- =============================================================================
-- FAULT LINE — Supabase schema (tables, indexes, triggers, Row Level Security)
-- Run this once in the Supabase SQL editor on a fresh project.
-- Idempotent-ish: safe to re-run on a project that already has these objects
-- (uses IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS throughout).
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_config jsonb not null default '{
    "skin": "#E8B48A", "hair": "#111111", "hairStyle": "short",
    "eyes": "dot", "eyebrows": "flat", "mouth": "line",
    "faceShape": "round", "accessory": "none"
  }'::jsonb,
  mood text not null default ':|',
  bio text,
  vibe_tags text[] not null default '{}',
  privacy_level text not null default 'pseudonymous'
    check (privacy_level in ('anonymous', 'pseudonymous', 'open')),
  fault_frequency jsonb,
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  onboarded boolean not null default false,
  suspended boolean not null default false,
  suspended_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row the moment someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, 'human_' || substr(replace(new.id::text, '-', ''), 1, 10))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Security-definer helpers used throughout RLS policies below.
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_moderator_or_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('moderator', 'admin')
  );
$$;

-- Prevent users from granting themselves admin/moderator via a normal UPDATE.
create or replace function public.enforce_role_immutable()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role = old.role;
  end if;
  if new.suspended is distinct from old.suspended and not public.is_moderator_or_admin() then
    new.suspended = old.suspended;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_role_immutable on public.profiles;
create trigger trg_profiles_role_immutable
  before update on public.profiles
  for each row execute function public.enforce_role_immutable();

-- ---------------------------------------------------------------------------
-- communities
-- ---------------------------------------------------------------------------
create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  icon text not null default '◎',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.community_members (
  user_id uuid not null references public.profiles(id) on delete cascade,
  community_id uuid not null references public.communities(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (user_id, community_id)
);

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  visibility text not null default 'public'
    check (visibility in ('public', 'community', 'anonymous')),
  community_id uuid references public.communities(id) on delete set null,
  risk_flag boolean not null default false,
  status text not null default 'visible'
    check (status in ('visible', 'removed', 'under_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_created_at on public.posts (created_at desc);
create index if not exists idx_posts_community on public.posts (community_id);
create index if not exists idx_posts_user on public.posts (user_id);

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- reactions  (one reaction per user per post; switching type overwrites it)
-- ---------------------------------------------------------------------------
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  reaction_type text not null
    check (reaction_type in ('same_here', 'feel_this', 'not_alone', 'ouch', 'too_real')),
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create index if not exists idx_reactions_post on public.reactions (post_id);

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  status text not null default 'visible' check (status in ('visible', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_comments_post on public.comments (post_id);

drop trigger if exists trg_comments_updated_at on public.comments;
create trigger trg_comments_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- subscriptions  (written only by the backend via the service_role key)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly', 'lifetime')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  amount_paise integer not null,
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user on public.subscriptions (user_id);

-- ---------------------------------------------------------------------------
-- reports + moderation
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  content_type text not null check (content_type in ('post', 'comment', 'user')),
  content_id uuid not null,
  reason text not null,
  status text not null default 'open'
    check (status in ('open', 'reviewing', 'dismissed', 'actioned')),
  created_at timestamptz not null default now()
);

create index if not exists idx_reports_status on public.reports (status);

create table if not exists public.moderation_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- blocks / mutes (safety)
-- ---------------------------------------------------------------------------
create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.user_mutes (
  muter_id uuid not null references public.profiles(id) on delete cascade,
  muted_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (muter_id, muted_id),
  check (muter_id <> muted_id)
);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.subscriptions enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_logs enable row level security;
alter table public.user_blocks enable row level security;
alter table public.user_mutes enable row level security;

-- profiles -------------------------------------------------------------------
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_self_or_mod" on public.profiles;
create policy "profiles_update_self_or_mod" on public.profiles
  for update using (auth.uid() = id or public.is_moderator_or_admin());

-- posts ------------------------------------------------------------------------
drop policy if exists "posts_select_visible" on public.posts;
create policy "posts_select_visible" on public.posts
  for select using (
    status = 'visible'
    or user_id = auth.uid()
    or public.is_moderator_or_admin()
  );

drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts
  for insert with check (auth.uid() = user_id);

drop policy if exists "posts_update_own_or_mod" on public.posts;
create policy "posts_update_own_or_mod" on public.posts
  for update using (auth.uid() = user_id or public.is_moderator_or_admin());

drop policy if exists "posts_delete_own_or_mod" on public.posts;
create policy "posts_delete_own_or_mod" on public.posts
  for delete using (auth.uid() = user_id or public.is_moderator_or_admin());

-- reactions ----------------------------------------------------------------
drop policy if exists "reactions_select_all" on public.reactions;
create policy "reactions_select_all" on public.reactions
  for select using (true);

drop policy if exists "reactions_insert_own" on public.reactions;
create policy "reactions_insert_own" on public.reactions
  for insert with check (auth.uid() = user_id);

drop policy if exists "reactions_update_own" on public.reactions;
create policy "reactions_update_own" on public.reactions
  for update using (auth.uid() = user_id);

drop policy if exists "reactions_delete_own" on public.reactions;
create policy "reactions_delete_own" on public.reactions
  for delete using (auth.uid() = user_id or public.is_moderator_or_admin());

-- comments -------------------------------------------------------------------
drop policy if exists "comments_select_visible" on public.comments;
create policy "comments_select_visible" on public.comments
  for select using (
    status = 'visible' or user_id = auth.uid() or public.is_moderator_or_admin()
  );

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "comments_update_own_or_mod" on public.comments;
create policy "comments_update_own_or_mod" on public.comments
  for update using (auth.uid() = user_id or public.is_moderator_or_admin());

drop policy if exists "comments_delete_own_or_mod" on public.comments;
create policy "comments_delete_own_or_mod" on public.comments
  for delete using (auth.uid() = user_id or public.is_moderator_or_admin());

-- communities ------------------------------------------------------------------
drop policy if exists "communities_select_all" on public.communities;
create policy "communities_select_all" on public.communities
  for select using (true);

drop policy if exists "communities_write_admin" on public.communities;
create policy "communities_write_admin" on public.communities
  for all using (public.is_admin()) with check (public.is_admin());

-- community_members -------------------------------------------------------
drop policy if exists "community_members_select_all" on public.community_members;
create policy "community_members_select_all" on public.community_members
  for select using (true);

drop policy if exists "community_members_insert_self" on public.community_members;
create policy "community_members_insert_self" on public.community_members
  for insert with check (auth.uid() = user_id);

drop policy if exists "community_members_delete_self_or_admin" on public.community_members;
create policy "community_members_delete_self_or_admin" on public.community_members
  for delete using (auth.uid() = user_id or public.is_admin());

-- subscriptions ------------------------------------------------------------
-- Intentionally NO insert/update policy for regular users: subscriptions are
-- only ever written by the backend using the service_role key (which
-- bypasses RLS), after a payment has been verified server-side.
drop policy if exists "subscriptions_select_own_or_admin" on public.subscriptions;
create policy "subscriptions_select_own_or_admin" on public.subscriptions
  for select using (auth.uid() = user_id or public.is_admin());

-- reports --------------------------------------------------------------------
drop policy if exists "reports_insert_self" on public.reports;
create policy "reports_insert_self" on public.reports
  for insert with check (auth.uid() = reporter_id);

drop policy if exists "reports_select_own_or_mod" on public.reports;
create policy "reports_select_own_or_mod" on public.reports
  for select using (auth.uid() = reporter_id or public.is_moderator_or_admin());

drop policy if exists "reports_update_mod" on public.reports;
create policy "reports_update_mod" on public.reports
  for update using (public.is_moderator_or_admin());

-- moderation_logs ------------------------------------------------------------
drop policy if exists "moderation_logs_admin_only" on public.moderation_logs;
create policy "moderation_logs_admin_only" on public.moderation_logs
  for all using (public.is_moderator_or_admin()) with check (public.is_moderator_or_admin());

-- blocks / mutes ---------------------------------------------------------------
drop policy if exists "user_blocks_owner" on public.user_blocks;
create policy "user_blocks_owner" on public.user_blocks
  for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

drop policy if exists "user_mutes_owner" on public.user_mutes;
create policy "user_mutes_owner" on public.user_mutes
  for all using (auth.uid() = muter_id) with check (auth.uid() = muter_id);

-- =============================================================================
-- Convenience views used by the app (bypass N+1 queries from the client)
-- =============================================================================
create or replace view public.posts_with_counts as
select
  p.*,
  coalesce(r.counts, '{}'::jsonb) as reaction_counts,
  coalesce(c.count, 0) as comment_count
from public.posts p
left join lateral (
  select jsonb_object_agg(reaction_type, cnt) as counts
  from (
    select reaction_type, count(*) as cnt
    from public.reactions
    where post_id = p.id
    group by reaction_type
  ) t
) r on true
left join lateral (
  select count(*) as count from public.comments where post_id = p.id and status = 'visible'
) c on true;

-- =============================================================================
-- First admin: after you sign up once through the app, run this manually:
--   update public.profiles set role = 'admin' where username = 'your_username';
-- Never do this from the client — it must be run in the Supabase SQL editor
-- (or via the service_role key from a trusted server context) so that
-- ordinary users can never grant themselves elevated access.
-- =============================================================================
