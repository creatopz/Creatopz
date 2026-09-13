-- Migration 018: Phase 2 (part 1) -- Creator of the Week / spotlight.
-- Additive only: one new table, one new public view. Nothing existing
-- touched. The "Selected" shareable badge (the other half of Phase 2)
-- needs no schema change at all -- it's pure UI over data that already
-- exists (an accepted campaign_applications row).

create table public.creator_spotlights (
  id uuid primary key default extensions.uuid_generate_v4(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  week_start date not null,
  headline text,
  stat_label text,
  stat_value text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.creator_spotlights enable row level security;

create policy "creator_spotlights: admin manages" on public.creator_spotlights
  for all using (is_admin()) with check (is_admin());

-- Public view: only published rows, and only the same safe columns
-- creators_public already exposes about the featured creator -- same
-- pattern as every other *_public view in this schema (the view's own
-- WHERE clause and column list are the safety boundary for anon
-- reads, since a view runs as its owner rather than re-checking the
-- underlying table's RLS).
create view public.creator_spotlights_public as
select cs.id, cs.creator_id, cs.week_start, cs.headline, cs.stat_label, cs.stat_value, cs.created_at,
       cp.name, cp.username, cp.category, cp.profile_image
from creator_spotlights cs
join creators_public cp on cp.id = cs.creator_id
where cs.is_published = true;
