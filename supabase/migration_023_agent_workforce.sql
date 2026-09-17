-- Migration 023: multi-agent workforce -- QA/Bug Detection Agent output log
-- and Lead/Visitor Communicator Agent lead capture. Additive only: two new
-- tables, nothing existing touched.

-- ===== QA / Bug Detection Agent =====
-- One row per run of agents/qa-agent/run.js. The script itself scans the
-- codebase/site (no user data involved) -- this table just gives the
-- business owner a shared, persistent view of its findings in the admin
-- console's "Virtual Office" panel, same role gallery_posts/creator_spotlights
-- play for their own admin sections.
create table public.agent_reports (
  id uuid primary key default extensions.uuid_generate_v4(),
  agent_name text not null,
  run_at timestamptz not null default now(),
  summary text not null,
  severity_counts jsonb not null default '{}'::jsonb,
  findings jsonb not null default '[]'::jsonb,
  needs_human_review boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.agent_reports enable row level security;

create policy "agent_reports: admin manages" on public.agent_reports
  for all using (is_admin()) with check (is_admin());

-- ===== Lead / Visitor Communicator Agent =====
-- Captured by the rule-based FAQ + lead-qualification widget on the public
-- site. Anonymous visitors can submit (it's a pre-signup contact form, same
-- trust level as any public "get in touch" form); nobody but admin can read
-- what's in it, matching the "never expose one visitor's info to another"
-- posture used everywhere else in this schema.
create table public.leads (
  id uuid primary key default extensions.uuid_generate_v4(),
  name text not null,
  contact text not null,
  need text not null,
  source_page text,
  high_intent boolean not null default false,
  needs_human_review boolean not null default false,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);
alter table public.leads enable row level security;

create policy "leads: anyone can submit" on public.leads
  for insert with check (
    length(name) between 1 and 120
    and length(contact) between 1 and 200
    and length(need) between 1 and 2000
  );

create policy "leads: admin manages" on public.leads
  for select using (is_admin());
create policy "leads: admin updates" on public.leads
  for update using (is_admin()) with check (is_admin());
create policy "leads: admin deletes" on public.leads
  for delete using (is_admin());
