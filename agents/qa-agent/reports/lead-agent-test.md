# Lead / Visitor Communicator Agent — verification

Two layers, both real (nothing simulated/fabricated):

## 1. Widget logic (headless browser, agents/qa-agent/test-lead-agent.js)

Drives real index.html with a stubbed Supabase client that records the
exact payload the widget builds. **17/17 checks passed**: launcher/panel
render and toggle correctly, greeting + quick replies show, FAQ matching
answers the platform-fee and how-it-works questions correctly (verified
against the real copy on for-brands.html), the escalation trigger
(pricing/contract language) routes to the lead form instead of a canned
answer, the submitted lead carries the right `needs_human_review: true`
and `high_intent: true` flags for that message, `source_page` is recorded,
a confirmation message shows after submit, zero uncaught JS exceptions,
zero console errors, and the widget is entirely absent from
admin-console.html.

One real bug was found and fixed in this pass: the panel's CSS set
`display:flex` with equal specificity to the browser's `[hidden]` rule,
so the widget was visible on page load before the launcher was ever
clicked. Fixed with an explicit `.lead-agent-panel[hidden]{ display:none; }`
override in css/theme.css.

## 2. RLS policy (direct against the real `leads` table, rolled back)

Since this sandbox can't reach the live Supabase REST endpoint over the
network (same CDN-blocking policy noted in run.js), the policy itself was
verified directly in Postgres as the `anon` role, inside `begin; ...
rollback;` so nothing was left behind:

- **Anon can insert a valid lead** (name/contact/need within their length
  limits) with no `.select()` chained — exactly how the widget calls it.
- **Anon sees zero rows** on `select count(*) from leads` — visitors can
  submit but never read anyone's leads, including their own.
- **An invalid insert is rejected** — an empty `name` violates the
  `length(name) between 1 and 120` check and the insert fails.

All three match the intended design exactly.
