-- Migration 015: let a brand see an applicant's rate card (not just
-- name/reach/category) when deciding whether to shortlist them --
-- get_campaign_applicants() previously left it out of its column list
-- even though rate_card itself has been readable by admin/the owning
-- creator all along; this only widens what THIS function returns to
-- the calling brand, still gated by the exact same ownership check as
-- before (is_admin() OR the caller owns the campaign).

drop function if exists public.get_campaign_applicants(uuid);

create function public.get_campaign_applicants(p_campaign_id uuid)
returns table(
  application_id uuid, status text, message text, created_at timestamptz,
  creator_id uuid, creator_user_id uuid, creator_name text, creator_username text,
  creator_profile_image text, creator_followers integer, creator_engagement_rate numeric,
  creator_category text, creator_rate_card jsonb
)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if not (
    is_admin()
    or p_campaign_id in (select id from campaigns where brand_id in (select id from brands where user_id = auth.uid()))
  ) then
    raise exception 'Not authorized.';
  end if;

  return query
    select
      ca.id, ca.status, ca.message, ca.created_at,
      c.id, c.user_id, c.name, c.username, c.profile_image, c.followers, c.engagement_rate, c.category, c.rate_card
    from campaign_applications ca
    join creators c on c.id = ca.creator_id
    where ca.campaign_id = p_campaign_id
    order by ca.created_at desc;
end;
$function$;

-- Dropping and recreating a function resets its grants to schema
-- defaults -- put it back to authenticated-only (the original had no
-- anon grant either; the internal auth check makes anon access safe
-- regardless, but this keeps the least-privilege posture from
-- migration_014 intact).
revoke execute on function public.get_campaign_applicants(uuid) from anon;
