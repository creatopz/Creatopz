# QA / Bug Detection Agent

Real, runnable scanner — not a simulation. It reads every `.html`/`js/*.js`
file in the repo (broken internal links, missing alt text, missing meta
tags, duplicate ids, leftover `console.log`/TODO markers, off-palette hex
colors) and drives a real headless Chromium across every page that doesn't
require a login (uncaught JS exceptions, `console.error`, horizontal
overflow at 320/375/390/430/1280px).

Creatopz has no error-tracking pipeline wired up yet (`js/error-monitoring.js`
is inactive), so this agent has no live user logs or bug reports to read —
"scans code ... and logs" here means the actual codebase and an actual
browser, which is the honest, buildable version of that brief in a static
site with no server.

## Run it

```
NODE_PATH=$(npm root -g) node agents/qa-agent/run.js
```

Run from the repo root. Writes `reports/latest.json` and `reports/latest.md`.

## Scope notes (so findings aren't misread)

- **Auth-gated pages are skipped**: admin-console.html, dashboard-brand.html,
  dashboard-creator.html, creator-onboarding.html, brand-onboarding.html.
  There's no real session to give them, and testing "redirects an anonymous
  visitor to auth.html" isn't a bug check.
- **play.html is skipped**: it boots via a runtime-loaded unpkg.com
  React/Babel bundle with no fallback. Verify it manually, or from a runner
  with real internet access.
- Every third-party CDN request (Supabase JS, Google Fonts) is stubbed
  during the browser pass — this checks the site's own code, not whether a
  CDN happens to be reachable from wherever the agent runs.
- Severity: **Critical** = uncaught JS exception on load. **High** =
  `console.error` on load, broken internal link, horizontal overflow, page
  fails to load. **Medium** = missing alt text, missing `<title>`/meta
  description. **Low** = leftover debug code, off-palette color, duplicate
  id, `target="_blank"` without `rel="noopener"`.

## Sharing results

After a run, insert the JSON summary into the `agent_reports` Supabase
table so it shows up in the admin console's Virtual Office panel:

```sql
insert into agent_reports (agent_name, summary, severity_counts, findings, needs_human_review)
values ('QA / Bug Detection Agent', '<summary from latest.json>', '<severity_counts>'::jsonb, '<findings>'::jsonb, false);
```

QA findings are code/site-health data, not pricing/contracts/payments/public
commitments, so `needs_human_review` is always `false` for this agent.
