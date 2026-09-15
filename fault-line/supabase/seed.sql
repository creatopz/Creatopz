-- Optional starter communities for FAULT LINE ("FIND YOUR WEIRD").
-- Safe to run once after schema.sql. Uses ON CONFLICT so it's re-runnable.

insert into public.communities (slug, name, description, icon, tags) values
  ('overthinking-department', 'THE OVERTHINKING DEPARTMENT', 'Humans currently spiraling about something that happened four years ago.', '◈', array['anxiety','overthinking']),
  ('socially-awkward-association', 'SOCIALLY AWKWARD ASSOCIATION', 'Nobody here knows how to start the conversation. That''s the point.', '▦', array['awkward','social']),
  ('dont-know-what-im-doing', 'PEOPLE WHO DON''T KNOW WHAT THEY''RE DOING', 'Probably everyone. Definitely you. Definitely us too.', '?', array['imposter-syndrome','career']),
  ('2am-thought-club', '2AM THOUGHT CLUB', 'Open when your brain refuses to sleep.', '☾', array['insomnia','late-night']),
  ('quiet-people-loud-minds', 'QUIET PEOPLE WITH LOUD MINDS', 'Typing...', '▤', array['introvert','inner-world']),
  ('chronic-people-pleasers', 'CHRONIC PEOPLE PLEASERS', 'Said "it''s fine" while it was, in fact, not fine.', '☍', array['boundaries','people-pleasing'])
on conflict (slug) do nothing;
