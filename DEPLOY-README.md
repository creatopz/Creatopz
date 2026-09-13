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
`supabase/migration_002` through `migration_018` are already applied there.
If you're standing up a **new/empty** project instead, run in this order:
`schema.sql` → `migration_002` → `003` → `004` → `005` → `006` → `007` →
`008` → `009` → `010` → `011` → `012` → `013` → `014` → `015` → `016` →
`017` → `018` → (optionally) `seed.sql` for sample rows on a dev project only.

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
- Creators publish a **rate card** (one rate per content type) instead of
  one flat number, in profile.html's edit form. Brands use it to **build a
  team** on a per-campaign basis (dashboard-brand.html → "Build your
  team →" on a campaign card): pick several creators, set how much of
  each content type from each, tracked live against the campaign's total
  budget. This plan (`campaign_team_picks`) is visible only to the brand
  and admin — nothing reaches a creator until admin approves a creator's
  picks into a real invite from admin-console.html's Campaigns tab.
- `creator-onboarding.html` / `brand-onboarding.html` — profile builder forms (with a live completion meter on the creator side)
- `spotlight.html` — public, no login: Creator of the Week + past features, reads `creator_spotlights_public`
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
  profile" on any dashboard, onboarding page, or admin listing. It only
  ever creates a missing row and never overwrites role/email/full_name
  on one that already exists.
- A creator applying to an open campaign, a brand inviting a creator to
  one of its own open briefs (profile.html → dashboard-creator.html,
  status `invited`), and a brand bookmarking a creator outside any one
  campaign (`brand_shortlists`, profile.html ↔ dashboard-brand.html) are
  all backed by real RLS policies and `is_campaign_open()`/
  `creator_has_applied_to_campaign()` SECURITY DEFINER helpers
  (migration_012) — none of these are client-side-only state.
- `creators_for_team_builder` (migration_013) is the one place a
  creator's rate card is visible to someone other than themself/admin —
  granted to `authenticated` only (revoked from `anon`), and still
  excludes Instagram handle/URL and audience detail the way
  creators_public does; a brand still can't message a creator directly,
  only plan against their rate and send that plan to admin.
  `campaign_team_picks` is RLS-scoped to the owning brand and admin —
  never the creator being planned around — until admin's "Approve &
  invite" turns a creator's planned rows into a real
  `campaign_applications` row (status `invited`, with a `deliverables`
  snapshot of exactly what was picked). That's also the first INSERT
  policy that lets admin create an application directly, for this
  purpose specifically.
- creators.category is one shared value written from three different
  pages -- auth.html's signup niche picker, creator-onboarding.html's
  `#category` dropdown, and (as campaigns.niche, matched against it for
  dashboard-creator.html's "match %") dashboard-brand.html's campaign
  niche chips. All three keep the exact same option list on purpose: a
  value from one that isn't also an option in another renders as no
  option selected there, and re-saving that form would silently blank
  or never-match a category a different page had set. Add a niche in
  one place, add it in all three.
- Rate-card transparency (migration_015): a brand sees an applicant's/
  saved creator's full rate card, not just a range, via
  `creators_for_team_builder` (saved creators, own query) or
  `get_campaign_applicants()` (the Applicants tab, RPC now returns
  `creator_rate_card`) -- never a raw `.select()` against `creators`
  itself, which stays owner-or-admin-only. `rateCardSummary()` in
  js/utils.js is the one renderer every page uses so the breakdown
  never drifts between admin/brand views.
- Platform fee (`PLATFORM_FEE_PCT` in js/utils.js, currently 9%) is a
  display-only business term, not a charge this app processes --
  Creatopz has no payment/escrow flow, admin mediates every deal
  off-platform. `feeBreakdown()` is the one place total/fee/net is
  computed, used consistently on the brand's post-campaign form, the
  team builder's allocatable pool (net of fee, not the raw total), and
  admin's view of every campaign's budget.
- Admin has the final say on a campaign's budget, not just its
  publish/decline: approving a draft (admin-console.html's Campaigns
  tab) includes an editable "final budget" field, pre-filled with the
  brand's request, that becomes `campaigns.budget_min`/`budget_max`
  the moment admin approves -- on top of the existing admin-only
  publish/reopen gate (migration_011) and admin's exclusive ability to
  finalize an application's `agreed_budget`.
- Rejection Receipt + Creatopz Score (migration_016), Phase 1 of the
  retention/trust feature set -- purely additive, nothing existing
  renamed or removed:
  - `campaign_applications.status` gained one more valid value,
    `'completed'` (alongside the existing `'invited'`), set only by
    admin (admin-console.html's "Mark completed" button on an
    `accepted` row) once a collab has actually happened -- this is what
    unlocks the brand's rating form for that application.
  - `application_feedback` (new table): a brand fills a required
    3-dropdown form (content-format fit / niche fit / reach fit, plus
    an optional note) when passing on an applicant
    (dashboard-brand.html's "Pass" button now opens this modal instead
    of rejecting immediately); the creator sees it inline under that
    rejected application in dashboard-creator.html. RLS: the owning
    brand can insert for their own campaign's application, the
    application's own creator (or admin) can read it, no one can
    update it after the fact.
  - `creator_ratings` (new table) + `creators.creatopz_score` /
    `creators.ratings_count` (new columns, kept in sync by trigger
    `sync_creatopz_score()` the same way `sync_creator_rate_range()`
    already keeps `rate_min`/`rate_max` in sync): once admin marks an
    application `'completed'`, the brand can rate delivery/
    communication/content-quality (1-5 each) from
    dashboard-brand.html's Applicants tab; the average becomes the
    creator's portable Creatopz Score, shown on their own dashboard
    stat tile and on profile.html's Rates tab, with a "Download my
    score card" button that renders a shareable PNG client-side via
    `renderScoreCard()` in js/utils.js (pure Canvas 2D API, no new
    dependency). RLS: only the owning brand can insert a rating for
    their own completed collab; creators never get direct table
    access, only the aggregate cached on their own `creators` row.
  - admin-console.html's Applications tab gained a read-only "Feedback
    trends" panel (grouped counts of the last 7 days' dropdown picks)
    for hand-copying into the anonymized weekly community post -- no
    Instagram API integration exists or is planned; this is a
    copy-from-the-admin-panel workflow.
  - `creators_public` (migration_017) gained `creatopz_score` and
    `ratings_count` in its column list so the score also shows
    correctly on a creator's *public* profile view, not just their own
    (own-profile view reads the base `creators` table directly and
    already had both columns from migration_016).
- Selected badge + Creator of the Week (migration_018), Phase 2 of the
  retention/trust feature set -- additive only:
  - The "Selected" share badge needs no schema at all -- it's pure UI
    over an `accepted` `campaign_applications` row. dashboard-creator.html
    shows a dismissible "You're selected!" banner (session-only dismiss,
    no new column) with Download and, where the browser supports the
    Web Share API with file sharing (`navigator.canShare({files})`),
    Share buttons -- both render the same canvas card via
    `renderSelectedBadge()` in js/utils.js. Being upfront: Share opens
    the device's native share sheet, not a guaranteed one-tap Instagram
    Stories deep link -- that needs a proprietary URL scheme Instagram
    only partially documents and doesn't work consistently cross-browser.
  - `creator_spotlights` (new table, admin-only via RLS) +
    `creator_spotlights_public` (new view, published rows only, same
    "safe view" pattern as `creators_public`/`campaigns_public`):
    admin-console.html's new Spotlight tab lets admin pick a creator
    (ranked by Creatopz Score/ratings as a starting suggestion, the
    pick is always admin's), add an optional headline/stat, and
    publish/unpublish/remove. `spotlight.html` (new, public, no login)
    lists the current feature plus an archive of past ones; index.html
    gained one new homepage section pulling this week's feature,
    hidden entirely when nothing's published rather than showing an
    empty placeholder. All existing public pages' nav gained one
    "Spotlight" link each -- no other change to those pages.
