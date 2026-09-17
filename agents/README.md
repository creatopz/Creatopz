# Creatopz virtual workforce

Six agents were scoped: Trend Research, QA/Bug Detection, SEO, Lead/Visitor
Communicator, Design/Creative, and Marketing/Business Promotion. Per the
brief, the two with the most immediate operational value were built and
verified first — **QA/Bug Detection** and **Lead/Visitor Communicator** —
before touching the rest.

**Current status: kept off the live site entirely, at explicit request.**
The QA agent (below) is backend/dev tooling only — it never touched any
page. A Lead/Visitor Communicator widget and an admin "Virtual Office"
dashboard were also built and verified (17-check and 14-check functional
tests, plus a real RLS check on the `leads` table), then deliberately
reverted out of every public page and out of admin-console.html — none of
that code is linked from anywhere live right now. It's still in this
branch's git history (commits adding "Lead/Visitor Communicator Agent" and
"Virtual Office dashboard") if it's ever wanted back. The `leads` and
`agent_reports` tables from migration_023 still exist (empty, harmless).

## What actually runs today

- **`agents/qa-agent/run.js`** — a Node + Playwright scanner that reads
  every real HTML/JS file and drives a real headless browser across every
  public page. See `agents/qa-agent/README.md`. Verified against the real
  repo: 0 critical/high findings, 49 low-stakes ones, every finding hand
  checked to rule out false positives before being logged. Run on demand
  (`NODE_PATH=$(npm root -g) node agents/qa-agent/run.js`); its output
  currently just writes local report files, not surfaced anywhere on the
  site since Virtual Office was reverted.

## Coordination rules, as designed (not currently surfaced anywhere)

- **Shared dashboard**: agents were designed to log to Supabase tables
  (`agent_reports`, `leads`) that only `is_admin()` can read, for a shared
  admin dashboard — that dashboard isn't live right now (see above).
- **Needs human review**: the Lead Agent's design flags
  `needs_human_review: true` on anything touching negotiated pricing,
  contracts, refunds, or payment specifics, rather than answering on its
  own authority. The QA agent's findings are code/site-health data, not
  commitments, so it never sets this flag.
- **Modular, one at a time**: each agent is its own file/table, buildable
  and pluggable independently.

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
