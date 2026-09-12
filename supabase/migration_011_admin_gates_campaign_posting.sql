-- Migration 011: admin controls campaign posting.
--
-- Requested directly: "As a admin i want control over campaing posting".
-- Until now a brand's insert with status='open' went straight to the
-- public directory with no admin review at all. This enforces, at the
-- database level (not just in the UI, which a brand could bypass by
-- calling the API directly), that:
--
--   * A brand's new campaign always starts as status='draft', regardless
--     of what status value the client sends. Drafts are invisible to
--     creators — campaigns_public only ever shows status='open' rows.
--   * A brand can only self-transition an already-live campaign from
--     'open' to 'closed' (pausing their own brief). Publishing a draft,
--     reopening a closed campaign, or any other status change requires
--     admin — admin bypasses this trigger entirely via is_admin().
--
-- Safe to run on a live project — additive trigger only; does not touch
-- existing rows.

create or replace function public.enforce_campaign_posting_control()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
begin
  if is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'draft';
    return new;
  end if;

  -- UPDATE by a non-admin (the owning brand, per the existing RLS policy):
  -- only allowed to move an open campaign to closed. Everything else
  -- (draft, reopening, completed) requires admin.
  if new.status is distinct from old.status and not (old.status = 'open' and new.status = 'closed') then
    raise exception 'Only Creatopz admin can publish, reopen or otherwise change a campaign''s status.';
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_enforce_campaign_posting_control on public.campaigns;
create trigger trg_enforce_campaign_posting_control
  before insert or update on public.campaigns
  for each row execute function public.enforce_campaign_posting_control();
