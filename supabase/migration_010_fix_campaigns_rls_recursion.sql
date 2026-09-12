-- Migration 010: fix infinite RLS recursion between campaigns and
-- campaign_applications.
--
-- Root cause of the repeated "campaign posting doesn't show up" reports:
-- campaigns' SELECT policy subqueried campaign_applications to let an
-- applicant creator read a campaign they'd applied to, while
-- campaign_applications' own SELECT/UPDATE policies subqueried campaigns
-- right back (to check ownership via the campaign's brand). Postgres
-- detects this as mutual recursion and raises "infinite recursion detected
-- in policy for relation campaigns" for ANY select under a restricted role
-- — including the brand's own `.select()` immediately after posting a new
-- campaign. The bare `.insert()` succeeded (inserts don't evaluate the
-- SELECT policy), so the brand saw no error, but the very next
-- loadCampaigns() call silently failed and the client fell back to an
-- empty array, making it look like the post never happened and prompting
-- brands to repost (see migration_009).
--
-- Fix: move the "applicant creator can read a campaign they applied to"
-- check into a SECURITY DEFINER helper function. A security-definer
-- function body runs with the privileges (and RLS bypass) of its owner,
-- so it can freely read campaign_applications without re-entering
-- campaigns' own policy — breaking the cycle.
--
-- Safe to run on a live project — replaces one policy only.

create or replace function public.creator_has_applied_to_campaign(p_campaign_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $function$
  select exists (
    select 1
    from campaign_applications ca
    join creators c on c.id = ca.creator_id
    where ca.campaign_id = p_campaign_id and c.user_id = p_user_id
  );
$function$;

drop policy if exists "campaigns: applicant creator can read campaigns they applied to" on public.campaigns;
create policy "campaigns: applicant creator can read campaigns they applied to"
  on public.campaigns for select
  using (public.creator_has_applied_to_campaign(id, auth.uid()));
