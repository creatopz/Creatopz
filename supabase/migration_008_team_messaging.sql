-- Migration 008: Part 5 — direct messaging between the Creatopz team and
-- creators/brands, separate from the campaign-application flow.
--
-- Safe to run on a live project — creates new tables only.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.profiles(id) on delete cascade, -- the creator/brand user
  subject text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  sent_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists idx_messages_conversation on public.messages(conversation_id, sent_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "conversations: participant or admin can read" on public.conversations;
create policy "conversations: participant or admin can read"
  on public.conversations for select
  using (participant_id = auth.uid() or is_admin());

drop policy if exists "conversations: participant can create own" on public.conversations;
create policy "conversations: participant can create own"
  on public.conversations for insert
  with check (participant_id = auth.uid() or is_admin());

drop policy if exists "conversations: participant or admin can update" on public.conversations;
create policy "conversations: participant or admin can update"
  on public.conversations for update
  using (participant_id = auth.uid() or is_admin())
  with check (participant_id = auth.uid() or is_admin());

drop policy if exists "messages: participant of the conversation or admin can read" on public.messages;
create policy "messages: participant of the conversation or admin can read"
  on public.messages for select
  using (
    is_admin()
    or conversation_id in (select id from public.conversations where participant_id = auth.uid())
  );

drop policy if exists "messages: participant or admin can send" on public.messages;
create policy "messages: participant or admin can send"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and (
      is_admin()
      or conversation_id in (select id from public.conversations where participant_id = auth.uid())
    )
  );

drop policy if exists "messages: recipient can mark read" on public.messages;
create policy "messages: recipient can mark read"
  on public.messages for update
  using (
    is_admin()
    or conversation_id in (select id from public.conversations where participant_id = auth.uid())
  )
  with check (
    is_admin()
    or conversation_id in (select id from public.conversations where participant_id = auth.uid())
  );

alter publication supabase_realtime add table public.messages;
