# Creatopz — deployable build

Upload the whole contents of this folder to any static host (Netlify drop,
Vercel, GitHub Pages, Hostinger, cPanel public_html). No build step.

## Live deploy: Cloudflare Workers (Static Assets)
This branch is connected to the Cloudflare Worker `creatopz` via Workers
Builds — every push here rebuilds and redeploys automatically, no CLI or
manual upload needed. `wrangler.jsonc` at the repo root points Workers'
static-asset serving at this same folder; `.assetsignore` keeps the SQL
migrations, docs and this deploy config out of what's actually served.
Custom domain `www.creatopz.in` is attached under that Worker's
Domains & Routes.

## Live Supabase project
`js/supabase-client.js` already points at the project this build was
developed and tested against (`vcidjppvvocdtrwanidp`). It already has real
signups on it — **do not run `schema.sql` or `seed.sql` against it.**
`supabase/migration_002` through `migration_008` are already applied there.
If you're standing up a **new/empty** project instead, run in this order:
`schema.sql` → `migration_002` → `003` → `004` → `005` → `006` → `007` →
`008` → (optionally) `seed.sql` for sample rows on a dev project only.

## Modernist pages (wired to live Supabase data)
- index.html ................ animated landing page
- directory.html ............ creator directory (search / filter / verified-only), reads creators_public
- play.html ................. ASMR arcade (3 toys, WebAudio sound) — no marketplace data
- auth.html .................. real signup/login (supabase auth), role-based redirect, session guard
- dashboard-creator.html .... real applications/open-briefs/notifications, Apply wired to campaign_applications
- dashboard-brand.html ...... real campaigns + applicants (get_campaign_applicants RPC), post/close campaigns, shortlist/pass, company profile editor
- profile.html .............. public view (?id=<creator_id>, via creators_public) + the real Edit Profile form when it's your own
- admin-console.html ........ applications (full mediation view), creators (verify/list/flag review), campaigns (close/reopen), gallery (publish/hide), Messages inbox
- messages.html ............. creator/brand inbox — one thread with the Creatopz team, live via Supabase Realtime

All eight load React/ReactDOM/Supabase from CDN + js/supabase-client.js
before support.js boots the page (support.js is a Design-Canvas runtime —
it needs window.React/ReactDOM present, which the CDN tags provide).

## Legacy pages (Supabase logic untouched, visual pass applied)
gallery.html, campaigns.html, creator-onboarding.html, brand-onboarding.html,
forgot-password.html, reset-password.html, terms.html, privacy.html now pull
their look from css/app.css, which was rewritten to the Modernist tokens
(--color-bg/#f3f2f2, --color-surface/#eae9e9, --color-text/#201e1d,
--color-accent/#ec3013, Archivo, zero corner radius). No markup/JS changed
in these pages, so their existing Supabase calls are exactly as before.

login.html, signup.html, admin.html, creator-dashboard.html,
brand-dashboard.html, creators.html, legacy-home.html are superseded by
auth.html/admin-console.html/dashboard-creator.html/dashboard-brand.html/
directory.html/index.html respectively — safe to delete once you've
confirmed the new pages against your live data.

## Security notes
- A user can never set their own role to 'admin' (DB trigger). Only
  creatopz.in@gmail.com can ever hold role='admin' — enforced even against
  an *existing* admin trying to promote a second account (migration_006).
- Creators/brands only see their own private data; public directory/profile
  go through safe views (creators_public, brands_public, campaigns_public)
  that exclude Instagram handle/URL, rate and budget.
- admin-console.html's Applications tab is the one place that shows the
  full picture on both sides (creator's Instagram + rate, brand's budget)
  since admin mediates every deal.
- is_verified can only ever be set by admin (migration_007) — a creator
  cannot self-verify. Suspicious self-reported stats auto-flag the profile
  and pull it out of the public directory until admin clears it.
- Instagram OAuth (pulling real follower/engagement numbers to compare
  against self-reported ones) needs a Meta developer app you register
  yourself — the schema (ig_verified_followers/engagement columns) is
  ready to receive that data once you have app credentials to wire up.
- Only admin can finalize ("accept") an application — creators can withdraw,
  brands can shortlist/reject, admin closes the loop (migration_002).
- Storage policies restrict avatar/logo uploads to the owner's own folder;
  gallery uploads are admin-only.
- conversations/messages (migration_008) are RLS-scoped to the participant
  or admin — nobody else can read a conversation they're not part of.
