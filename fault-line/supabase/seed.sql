-- ============================================================================
-- FAULT LINE — seed data
-- Safe to run on a production project: this only seeds reference data
-- (Fault Zones + personality quiz questions), never fake user accounts.
-- Run once, after schema.sql.
-- ============================================================================

insert into public.fault_zones (slug, name, description, theme, is_featured)
values
  ('the-overthinkers', 'THE OVERTHINKERS', 'For the ones replaying the conversation at 2am.', 'blue', true),
  ('socially-awkward', 'SOCIALLY AWKWARD', 'Nobody here knows how to start the conversation either.', 'acid', true),
  ('former-people-pleasers', 'FORMER PEOPLE-PLEASERS', 'Recovering from saying "it''s fine" when it wasn''t.', 'red', true),
  ('the-3am-club', 'THE 3AM CLUB', 'Thoughts that only show up when everyone else is asleep.', 'blue', true),
  ('clumsy-humans', 'CLUMSY HUMANS', 'Tripped over nothing. Twice. In public.', 'acid', false),
  ('pretending-im-fine', 'PRETENDING I''M FINE', 'The mask is on. It is very convincing. It is exhausting.', 'red', true),
  ('quietly-jealous', 'QUIETLY JEALOUS', 'Happy for them. Also, not.', 'red', false),
  ('imposter-syndrome-inc', 'IMPOSTER SYNDROME INC.', 'Waiting for everyone to realize you''re winging it.', 'blue', false)
on conflict (slug) do nothing;

insert into public.personality_questions (prompt, order_index)
values
  ('When you accidentally wave back at someone who wasn''t waving at you, what do you do?', 1),
  ('Do you rehearse conversations before they happen?', 2),
  ('What''s worse: being ignored, or being misunderstood?', 3),
  ('Do you become funnier when you''re uncomfortable?', 4),
  ('How long do you think about something embarrassing after it happens?', 5),
  ('Do you say "I''m fine" more often than you mean it?', 6),
  ('When a group photo comes out, whose face do you check first?', 7),
  ('Do you screenshot texts to analyze later?', 8)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- OPTIONAL demo content (posts/comments) is intentionally NOT included here.
-- Posts require a real auth.users row (author_id has a foreign key into
-- public.profiles -> auth.users), so fabricating them would mean creating
-- fake accounts — which this project treats as a hard line. If you want a
-- populated feed for a demo/staging environment, sign up a few real (throwaway)
-- accounts through the app's own /auth/sign-up flow and post through the UI;
-- that keeps demo data structurally identical to production and easy to
-- delete later (delete the auth.users row and everything cascades).
-- ----------------------------------------------------------------------------
