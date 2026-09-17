# Creatopz virtual workforce

Six agents were scoped: Trend Research, QA/Bug Detection, SEO, Lead/Visitor
Communicator, Design/Creative, and Marketing/Business Promotion. Per the
brief, the two with the most immediate operational value were built and
verified first — **QA/Bug Detection** and **Lead/Visitor Communicator** —
before touching the rest. Both are real, running code, not mockups.

## What's live

- **`agents/qa-agent/run.js`** — a Node + Playwright scanner that reads
  every real HTML/JS file and drives a real headless browser across every
  public page. See `agents/qa-agent/README.md`. Verified against the real
  repo: 0 critical/high findings, 49 low-stakes ones, every finding hand
  checked to rule out false positives before being logged.
- **`js/lead-agent.js`** — a rule-based FAQ + lead-qualification widget on
  11 public pages, backed by the `leads` Supabase table. See the widget's
  own doc comment and `agents/qa-agent/reports/lead-agent-test.md` for its
  17-check functional test plus a direct (rolled-back) RLS verification.
- **Virtual Office** — a new view in `admin-console.html` (the business
  owner's existing single pane of glass) showing both agents' live output:
  a Needs Human Review queue, the full leads table, the QA agent's latest
  report, and status cards for all 6 agents (2 live, 4 planned). Verified
  with a 14-check functional test
  (`agents/qa-agent/test-virtual-office.js`).

## Coordination rules, as actually implemented

- **Shared dashboard**: both agents log to Supabase tables
  (`agent_reports`, `leads`) that only `is_admin()` can read, surfaced in
  Virtual Office.
- **Needs human review**: the Lead Agent flags `needs_human_review: true`
  on anything touching negotiated pricing, contracts, refunds, or payment
  specifics — those visitors get routed to the lead form instead of a
  canned answer, and show up in the review queue, not sent or published
  anywhere autonomously. The QA agent's findings are code/site-health
  data, not commitments, so it never sets this flag.
- **Modular, one at a time**: each agent is its own file/table, callable
  independently, already plugged into the one shared Virtual Office view.

## Honest scope — what this is and isn't

This runs in a sandboxed session with no persistent server process and no
Anthropic API key available to embed in client-side code. That rules out
two things a literal reading of "AI employee" might imply, and both are
worth saying plainly rather than quietly building something narrower:

- **No 24/7 autonomous execution.** The QA agent is a script you (or a
  scheduled CI job, if one gets set up later) run on demand — it doesn't
  watch the live site continuously on its own.
- **The Lead Agent is rule-based, not a free-form LLM conversation.** It
  matches visitor questions against a small, curated set of answers
  pulled from copy already live on the site, and hands off to a human for
  anything it can't answer confidently or that involves pricing/contract
  specifics. If a real conversational agent is wanted later, that needs a
  server-side Anthropic API key supplied as a secret — happy to build that
  layer on top of this one once that's available.

## Not yet built

Trend Research, SEO, Design/Creative, and Marketing/Business Promotion
agents — scoped and shown as "Planned" cards in Virtual Office, to be
built the same way (real, runnable, verified before being reported done)
once the first two are confirmed working end to end.
