-- Migration 007: Part 4 — fake-portfolio detection.
--
-- 1. Locks the verified badge to admin (creators could otherwise self-verify
--    since the existing "owner or admin" update policy only checks row
--    ownership, not which column changed).
-- 2. Adds columns to store Instagram-API-pulled numbers alongside the
--    self-reported ones, ready for when Instagram OAuth is wired up.
-- 3. Auto-flags implausible self-reported stats and keeps a flagged
--    profile out of the public directory (is_public forced false) until
--    admin clears it from the review queue in admin-console.html.
--
-- Safe to run on a live project — additive only.

create or replace function public.prevent_creator_self_verify()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if new.is_verified is distinct from old.is_verified and not is_admin() then
    raise exception 'Only Creatopz admin can verify a creator.';
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_prevent_creator_self_verify on public.creators;
create trigger trg_prevent_creator_self_verify
  before update on public.creators
  for each row execute function public.prevent_creator_self_verify();

alter table public.creators add column if not exists flagged_for_review boolean not null default false;
alter table public.creators add column if not exists ig_verified_followers integer;
alter table public.creators add column if not exists ig_verified_engagement numeric;
alter table public.creators add column if not exists ig_connected_at timestamptz;
comment on column public.creators.flagged_for_review is 'Auto-set when self-reported stats look implausible (bought followers / bot engagement); kept out of the public directory until admin clears it.';
comment on column public.creators.ig_verified_followers is 'Follower count pulled from the Instagram API, stored alongside the self-reported value so a mismatch is visible.';
comment on column public.creators.ig_verified_engagement is 'Engagement rate computed from Instagram API data (likes+comments / followers on recent posts).';

create or replace function public.flag_suspicious_creator_stats()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  suspicious boolean;
begin
  suspicious := (
    coalesce(new.followers, 0) >= 500 and (
      coalesce(new.engagement_rate, 0) = 0
      or (new.followers > 5000 and new.engagement_rate < 0.5)
      or new.engagement_rate > 15
    )
  );

  if tg_op = 'UPDATE' and is_admin() and new.flagged_for_review is distinct from old.flagged_for_review then
    -- Admin explicitly clearing/setting the flag from the review queue wins.
    return new;
  end if;

  new.flagged_for_review := suspicious;
  if suspicious then
    new.is_public := false;
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_flag_suspicious_creator_stats on public.creators;
create trigger trg_flag_suspicious_creator_stats
  before insert or update of followers, engagement_rate on public.creators
  for each row execute function public.flag_suspicious_creator_stats();
