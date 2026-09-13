# Creatopz — deployable build

Upload the whole contents of this folder to any static host (Netlify drop,
Vercel, GitHub Pages, Hostinger, cPanel public_html). No build step — every
page is plain HTML/CSS/vanilla JS.

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
`supabase/migration_002` through `migration_011` are already applied there.
If you're standing up a **new/empty** project instead, run in this order:
`schema.sql` → `migration_002` → `003` → `004` → `005` → `006` → `007` →
`008` → `009` → `010` → `011` → (optionally) `seed.sql` for sample rows on
a dev project only.

## Design system
`css/theme.css` is the one stylesheet for the whole marketplace: a warm
cream/ink palette, large radii, soft shadows, pill buttons, Bricolage
Grotesque + Inter type. `js/nav.js` wires up the shared header (mobile
full-screen drawer) and the generic `.modal-backdrop` open/close pattern
used everywhere a dialog appears. Every page below links `theme.css` and,
where they show data, `js/nav.js` — build new pages from the same classes
(`.btn`, `.card`, `.badge`, `.field`/`.input`, `.dash-shell`, etc.) instead
of one-off styles.

`play.html` (an ASMR arcade extra, unrelated to the marketplace) still runs
on the old React + `support.js` Design-Canvas runtime and is not linked
from any page's navigation — leave it alone or delete it, your call.

## Pages
- `index.html` — landing page (hero, platform split, how-it-works, CTAs)
- `directory.html` — creator directory (search/filter/sort), reads `creators_public`
- `campaigns.html` — public campaign marketplace + apply modal
- `auth.html` — login + 3-step signup wizard (role → account → niches)
- `dashboard-creator.html` — sidebar dashboard: overview, applications, browse campaigns, notifications
- `dashboard-brand.html` — sidebar dashboard: overview, campaigns, applicants, shortlist, post-campaign + company-profile modals
- `profile.html` — creator media kit (`?id=<creator_id>` for the public view; your own profile is editable)
- `admin-console.html` — applications mediation, creators, campaigns, gallery, messages (dark, admin-only)
- `messages.html` — creator/brand inbox with the Creatopz team, live via Supabase Realtime
- `creator-onboarding.html` / `brand-onboarding.html` — profile builder forms (with a live completion meter on the creator side)
- `gallery.html`, `forgot-password.html`, `reset-password.html`, `terms.html`, `privacy.html`

## Security notes
- A user can never set their own role to 'admin' (DB trigger). Only
  creatopz.in@gmail.com can ever hold role='admin' — enforced even against
  an *existing* admin trying to promote a second account (migration_006).
  **If admin-console.html ever silently bounces creatopz.in@gmail.com to
  a regular dashboard after login**, that account's role has reverted to
  'creator'/'brand' and there's a chicken-and-egg lock: the same trigger
  that protects the admin role also blocks the *first* promotion once no
  admin exists to authorize it. See the bootstrap procedure documented in
  `supabase/migration_005_lock_admin_role.sql` step 3 (disable the
  trigger, set the role, re-enable it — three separate statements).
- Creators/brands only see their own private data; public directory/profile
  go through safe views (creators_public, brands_public, campaigns_public)
  that exclude Instagram handle/URL, rate and budget.
- admin-console.html's Applications tab is the one place that shows the
  full picture on both sides (creator's Instagram + rate, brand's budget)
  since admin mediates every deal. All of this is enforced by RLS + the
  `is_admin()` policy helper, not just by hiding the admin nav link — a
  non-admin hitting admin-console.html client-side-redirects away, and the
  underlying tables refuse the reads/writes regardless.
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
- campaigns/campaign_applications' RLS policies no longer mutually
  recurse (migration_010) — a prior policy had campaigns' SELECT check
  subquery campaign_applications, whose own policies subqueried campaigns
  right back, which Postgres rejects as infinite recursion for any
  non-superuser select.
- Every new campaign is admin-gated (migration_011): a brand's insert
  always lands as `status='draft'` (invisible to creators) no matter what
  the client sends, and a brand can only self-close an already-open
  campaign — publishing a draft or reopening a closed one requires admin.
  Enforced by a DB trigger, not just the UI. Admin approves/declines
  drafts from admin-console.html's Campaigns tab.
- `ensureProfileRow()` in `js/auth.js` self-heals a signup that never got
  its `profiles`/`creators`/`brands` row written (e.g. email confirmation
  delayed the session past the point RLS would allow the insert) — it
  runs the first time `getCurrentProfile()` finds no row for a logged-in
  user, so a slow-confirming signup can never end up "logged in with no
  profile" on any dashboard, onboarding page, or admin listing.
