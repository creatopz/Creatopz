-- Migration 025: creator_ratings had insert-only RLS for the owning
-- brand -- no select policy besides admin. That meant a brand's own
-- dashboard could never tell, on reload, whether a completed collab had
-- already been rated: RATED_APPLICATION_IDS was populated purely
-- client-side from the current session's own submit, so a page refresh
-- always showed "Rate this collab" again even after rating, with no way
-- to confirm it actually saved. Additive: one new select policy, nothing
-- existing touched.

create policy "creator_ratings: brand can read own" on public.creator_ratings
  for select using (brand_id in (select id from brands where user_id = auth.uid()));
