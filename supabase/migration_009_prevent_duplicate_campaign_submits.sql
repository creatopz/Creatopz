-- Migration 009: server-side backstop against accidental double-submitted
-- campaigns. Seen twice live (identical title/budget from the same brand,
-- seconds apart) despite the client-side disable-while-saving fix — this
-- blocks a second campaign with the same brand_id + title within 15
-- seconds, independent of whatever the client is doing.
--
-- Safe to run on a live project — additive only.

create or replace function public.prevent_rapid_duplicate_campaign()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if exists (
    select 1 from public.campaigns
    where brand_id = new.brand_id
      and title = new.title
      and created_at > now() - interval '15 seconds'
  ) then
    raise exception 'Duplicate submission detected — a campaign with this title was just created. Refresh before posting again.';
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_prevent_rapid_duplicate_campaign on public.campaigns;
create trigger trg_prevent_rapid_duplicate_campaign
  before insert on public.campaigns
  for each row execute function public.prevent_rapid_duplicate_campaign();
