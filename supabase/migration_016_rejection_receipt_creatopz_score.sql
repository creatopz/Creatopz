-- Migration 016: Phase 1 -- Rejection Receipt + Creatopz Score
-- Additive only. Nothing existing is renamed, dropped, or reinterpreted.

-- 1. Allow 'completed' as a valid campaign_applications.status
--    (same technique already used twice this session to add 'invited').
alter table public.campaign_applications drop constraint if exists campaign_applications_status_check;
alter table public.campaign_applications add constraint campaign_applications_status_check
  check (status = any (array['pending','shortlisted','accepted','rejected','withdrawn','invited','completed']));

-- 2. Structured rejection feedback, one per application. A brand fills
-- this in when passing on an applicant (dashboard-brand.html); the
-- creator sees it attached to that application in their own dashboard.
create table public.application_feedback (
  id uuid primary key default extensions.uuid_generate_v4(),
  application_id uuid not null unique references public.campaign_applications(id) on delete cascade,
  content_format_fit text not null check (content_format_fit in (
    'Wanted shorter/vertical format', 'Wanted different content style', 'Good fit, just not selected this time'
  )),
  niche_fit text not null check (niche_fit in ('Strong niche match', 'Off-niche for this brief')),
  reach_fit text not null check (reach_fit in (
    'Reach was right', 'Wanted larger reach', 'Wanted smaller/more niche reach'
  )),
  note text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.application_feedback enable row level security;

create policy "application_feedback: brand can create for own campaign" on public.application_feedback
  for insert with check (
    application_id in (
      select ca.id from campaign_applications ca
      join campaigns c on c.id = ca.campaign_id
      join brands b on b.id = c.brand_id
      where b.user_id = auth.uid()
    )
  );
create policy "application_feedback: creator or admin can read" on public.application_feedback
  for select using (
    is_admin()
    or application_id in (
      select ca.id from campaign_applications ca
      join creators cr on cr.id = ca.creator_id
      where cr.user_id = auth.uid()
    )
  );

-- 3. One rating per completed collab. A brand rates delivery/
-- communication/content quality (1-5 each) once admin has marked an
-- accepted application 'completed'.
create table public.creator_ratings (
  id uuid primary key default extensions.uuid_generate_v4(),
  application_id uuid not null unique references public.campaign_applications(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  delivery_score int not null check (delivery_score between 1 and 5),
  communication_score int not null check (communication_score between 1 and 5),
  content_quality_score int not null check (content_quality_score between 1 and 5),
  created_at timestamptz not null default now()
);
alter table public.creator_ratings enable row level security;

create policy "creator_ratings: brand can rate own completed collab" on public.creator_ratings
  for insert with check (
    brand_id in (select id from brands where user_id = auth.uid())
    and application_id in (select id from campaign_applications where status = 'completed')
  );
create policy "creator_ratings: admin can read all" on public.creator_ratings
  for select using (is_admin());

-- 4. Aggregate "Creatopz Score" on creators, kept in sync by trigger --
-- same pattern as the existing sync_creator_rate_range() trigger
-- (migration_013): the creators row is a cache, creator_ratings is the
-- source of truth, and every insert/update/delete recomputes it.
alter table public.creators add column if not exists creatopz_score numeric;
alter table public.creators add column if not exists ratings_count int not null default 0;

create or replace function public.sync_creatopz_score()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $$
declare
  target_creator_id uuid;
  avg_score numeric;
  cnt int;
begin
  target_creator_id := coalesce(new.creator_id, old.creator_id);
  select avg((delivery_score + communication_score + content_quality_score) / 3.0), count(*)
    into avg_score, cnt
    from creator_ratings where creator_id = target_creator_id;
  update creators set creatopz_score = avg_score, ratings_count = coalesce(cnt, 0) where id = target_creator_id;
  return coalesce(new, old);
end;
$$;

create trigger trg_sync_creatopz_score
  after insert or update or delete on public.creator_ratings
  for each row execute function public.sync_creatopz_score();
