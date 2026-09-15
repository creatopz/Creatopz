# FAULT LINE

> You don't have to look okay here.

A confessional social platform: Swiss editorial grid × retro pixel art ×
underground internet culture. Built with Next.js 14 (App Router) +
TypeScript + Tailwind + Framer Motion, backed by Supabase (Auth, Postgres,
Row Level Security) and Razorpay for payments.

This app lives in its own `fault-line/` folder inside the `creatopz`
repository and is completely independent of the existing Creatopz static
site at the repo root — no files outside this folder were touched.

---

## 1. What's actually implemented

This is a real, working application — not a static mockup:

- **Auth**: email/password, magic link, Google OAuth (if you enable it in
  Supabase), password reset, account deletion — all via Supabase Auth.
- **Onboarding**: handle picker with live availability check, a from-scratch
  pixel avatar builder (SVG, no uploads), vibe tags, privacy level, and an
  optional "Fault Frequency" quiz.
- **The Cracks** (main feed): text-first confession posts, five emotional
  reactions (no likes/follower counts), threaded comments, anonymous
  posting, community-scoped feeds, cursor-based pagination.
- **Find Your Weird** (communities): browse/join communities, and a
  standalone "Fault Frequency" matching quiz (works signed-out too).
- **Pricing + Razorpay**: ₹1/30 days, ₹12/1 year, ₹699 lifetime. Orders are
  created server-side, payments are verified via HMAC signature both
  client-side (fast UX path) and via an authoritative webhook (handles
  duplicate/failed events, is the source of truth if the client never
  reports back).
- **Admin panel** (`/admin`): dashboard stats, user search/suspend/delete,
  post moderation, community CRUD, and a reports/moderation queue — gated
  by a real `role` column checked server-side on every request, not just
  hidden in the UI.
- **Safety**: a client-side first-pass risk detector interrupts posting
  with real crisis resources before anything is sent; risk-flagged posts
  are queued for human review instead of published; report/block/mute;
  per-user post rate limiting enforced server-side.
- **Human Receipt** and **Daily Crack** — the two screenshot-shareable
  features from the brief.
- Full Row Level Security in Postgres — every table is locked down so the
  database itself enforces "edit only your own stuff," not just the API
  routes.

## 2. What's simplified (be aware before calling this "done")

Given the scope of the original brief, a few things are intentionally
lighter than a full production build:

- Sound is synthesized in-browser via WebAudio (tiny retro blips) rather
  than shipped audio files — keeps the bundle small and avoids licensing
  any sample packs; swap in real files in `components/providers/SoundProvider.tsx`
  if you want a specific sound design.
- The landing page's scroll choreography covers the hero, problem,
  intro, communities, pricing, and ending beats from the brief; it does not
  implement every micro-easter-egg listed (the logo-click and idle-walker
  ones are in; a few others aren't).
- "Humans you connected with" is approximated as reaction counts on your
  posts rather than a full connections graph — there's no `connections`
  table in this schema.
- The self-harm risk detector is a first-pass keyword check, not a
  moderation-grade classifier. It exists to interrupt the flow with real
  resources and to queue the post for human review — it is not a
  substitute for a trained moderation team.

## 3. Setup

### 3.1 Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the entire contents of `supabase/schema.sql`.
3. Optionally run `supabase/seed.sql` to get starter communities.
4. **Project Settings → API**: copy the Project URL and `anon` public key.
5. **Project Settings → API → service_role key**: copy it too — this stays
   server-side only, never in `NEXT_PUBLIC_*`.
6. (Optional) **Authentication → Providers → Google** if you want Google
   sign-in.
7. **Authentication → URL Configuration**: add your site URL (and
   `http://localhost:3000` for local dev) to Redirect URLs.

### 3.2 Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_WEBHOOK_SECRET=
```

### 3.3 Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### 3.4 Create your first admin

Sign up normally through the app, then in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where username = 'your_username';
```

This is deliberately impossible to do from the app itself — see
`enforce_role_immutable()` in `schema.sql`.

### 3.5 Razorpay

1. Create a Razorpay account, get your test API keys.
2. Set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
3. In the Razorpay dashboard, add a webhook pointing at
   `https://yourdomain.com/api/subscriptions/webhook`, subscribed to
   `payment.captured` and `payment.failed`. Copy its secret into
   `RAZORPAY_WEBHOOK_SECRET`.
4. Test with Razorpay's test card numbers before going live.

## 4. Deployment

Deploy like any Next.js app — Vercel is the path of least resistance:

```bash
vercel
```

Set the same environment variables in your hosting provider's dashboard.
Make sure `NEXT_PUBLIC_SITE_URL` matches your real production domain (used
to build auth email redirect links).

### Deploying to Netlify

This repo includes a `netlify.toml` that wires up `@netlify/plugin-nextjs`,
which is required — this app uses middleware, API routes, and
server-rendered pages throughout, none of which work as a plain static
export.

1. Connect the repo (or `netlify deploy`) as normal — Netlify picks up
   `netlify.toml` and installs the Next.js runtime automatically.
2. **Site configuration → Environment variables** — add every variable
   from `.env.example` (Netlify does **not** read your local `.env.local`;
   it only deploys what's committed, and secrets are never committed).
   At minimum, the site won't render at all without:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   And these are required for admin actions / payments to work:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_WEBHOOK_SECRET`
3. Set `NEXT_PUBLIC_SITE_URL` to your real Netlify URL (e.g.
   `https://myfaultline1.netlify.app`), and add that same URL (plus
   `/auth/callback`) to **Supabase → Authentication → URL Configuration →
   Redirect URLs**, or magic links / password resets / OAuth will redirect
   to the wrong place.
4. Trigger a redeploy after adding env vars — Netlify does not hot-reload
   them into an already-built site.

## 5. Project structure

```
fault-line/
  app/                  Next.js App Router pages + API routes
    admin/              Admin panel (role-gated server components + actions)
    api/                Route handlers (posts, reactions, comments, communities,
                         subscriptions, admin, onboarding, safety reports)
    auth/                Login/signup/reset + server actions
    cracks/              Main feed + post detail
    communities/         Community list + individual community feed
  components/           Reusable UI (PixelAvatar, PostCard, ReactionBar, ...)
    admin/               Admin-only components
    landing/             Landing page sections
    onboarding/          Avatar builder + wizard
    providers/           SoundProvider
  lib/                  Supabase clients, types, prompts, safety, razorpay
  supabase/
    schema.sql           Tables, RLS policies, triggers — run this first
    seed.sql              Starter communities
```

## 6. Security notes

- Every table has Row Level Security enabled; the anon/authenticated
  client can never bypass it, even if an API route has a bug.
- The `service_role` key is only ever imported in files marked
  `import "server-only"` (`lib/supabase/admin.ts`, `lib/razorpay.ts`), and
  only used after re-verifying the caller's identity/role server-side.
- Subscriptions have no client-writable RLS policy at all — they can only
  be created/updated from the trusted server routes using the service role,
  after Razorpay signature verification.
- Role escalation is blocked at the database level (`enforce_role_immutable`
  trigger), not just hidden in the UI.
