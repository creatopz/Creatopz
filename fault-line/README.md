# FAULT//LINE

> A place for the version of you that doesn't fit in the feed.

An anonymous-but-personal social platform: pixel avatars instead of real
photos, Fault Zones instead of Groups, and an interactive landing page that
cracks open as you scroll. Full-stack, production-shaped — real Supabase
Postgres + Auth + RLS, real Razorpay payments verified server-side, a
role-gated admin panel, not a static mockup.

## Stack

- **Next.js 16** (App Router) + **TypeScript**, strict mode
- **Tailwind CSS** for the design system (see `src/app/globals.css` for the
  hand-rolled bits: the fault-line rule, doodle wiggle, reveal-on-scroll)
- **Supabase**: Postgres, Auth, Row Level Security (`supabase/schema.sql`)
- **Razorpay** for ₹1 / ₹12 / ₹699 subscriptions, verified server-side + webhook
- Zero UI component libraries, zero animation libraries — every motion in
  the landing page is plain CSS or a few lines of `IntersectionObserver` /
  `requestAnimationFrame`. Sound effects are synthesized with the Web Audio
  API (`src/lib/sound.ts`), not audio files.

## Project structure

```
src/
  app/
    (marketing)/        landing page, /pricing, /zones, /guidelines, /privacy, /safety
    auth/                sign-up, log-in, forgot/reset password, OAuth-style callback
    onboarding/          avatar + username + personality quiz + zone picks wizard
    (app)/               feed, account — gated, requires a completed profile
    admin/               dashboard, moderation, zones, users, analytics — role-gated
    api/                 posts, reactions, reports, payments (order/verify/webhook)
  components/
    landing/             every landing-page section, one file each
    avatar/              the pixel avatar renderer + builder (the signature feature)
    feed/ onboarding/ zones/ pricing/ app/
  lib/                   supabase clients, avatar config, sound, safety, razorpay
  types/database.ts      hand-written Database type mirroring schema.sql
supabase/
  schema.sql             tables, indexes, RLS policies, triggers
  seed.sql                Fault Zones + personality quiz questions (safe for prod)
```

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Razorpay values, see below
npm run dev
```

### 1. Supabase project

1. Create a project at supabase.com.
2. **SQL Editor** → paste and run the entirety of `supabase/schema.sql`.
3. Then run `supabase/seed.sql` (Fault Zones + quiz questions — safe to run
   on a live project, contains no fake accounts).
4. **Project Settings → API** → copy the Project URL, `anon` public key, and
   `service_role` key into `.env.local`. **Never** put the service role key
   behind `NEXT_PUBLIC_` — it's read only by `src/lib/supabase/admin.ts`,
   which is marked `server-only` so an accidental client import fails the
   build.
5. **Authentication → URL Configuration**: add your deployed URL (and
   `http://localhost:3000` for local dev) to Redirect URLs, so
   `/auth/callback` works for email confirmation links.

### 2. Make yourself an admin

Sign up normally through the app, then in the SQL Editor:

```sql
update public.profiles set role = 'admin' where anonymous_username = 'your_username';
```

`/admin` is role-gated server-side (`src/lib/admin-guard.ts`) — it 404s for
anyone who isn't `admin` or `moderator`, logged in or not. There's no
frontend "if isAdmin show button" anywhere; every admin action re-checks the
role on the server before touching data with the service-role client.

### 3. Razorpay

1. Dashboard → **Settings → API Keys** → generate test (or live) keys → put
   `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   in `.env.local`.
2. Dashboard → **Settings → Webhooks** → add
   `https://yourdomain.com/api/payments/webhook`, subscribe to
   `payment.captured`, set a secret, put it in `RAZORPAY_WEBHOOK_SECRET`.
3. That's it — `/pricing` creates a real order server-side
   (`/api/payments/create-order`), Razorpay Checkout collects payment
   client-side, and activation happens twice, independently: once from the
   client's immediate callback (`/api/payments/verify`, signature-checked)
   and once from the webhook (the actual source of truth, in case the user
   closes the tab). Both paths are idempotent on `razorpay_payment_id`.

### 4. Deploy

Any Next.js host works (Vercel is the path of least resistance — `next
build` just works, no special config). Set the same env vars from
`.env.example` in the host's dashboard. Point the Razorpay webhook at the
deployed domain.

## Design system, briefly

- **Palette**: `#F4F1EA` paper, `#111111` ink, with `#FF3B30` red /
  `#245CFF` blue / `#C7FF00` acid used sparingly as "emotional
  interruptions" — see `tailwind.config.ts`.
- **Type**: Archivo (bold, uppercase headlines), IBM Plex Mono (timestamps,
  usernames, system text — the `.sys` class), Press Start 2P (pixel font,
  used only for tiny accents, never body copy).
- **The avatar system** (`src/lib/avatar.ts` + `src/components/avatar/`) is
  a from-scratch layered-SVG pixel character generator — skin tone, face
  shape, hairstyle, eyes, eyebrows, clothing, accessory, a "weird detail,"
  and a background, plus a separate, changeable **expression** (dead
  inside, pretending to be fine, crying but okay, …) that's decoupled from
  the avatar's structure, because a mood isn't an identity.

## Safety

- Every post can be reported (`/api/reports`); reports land in
  `/admin/moderation` for human review.
- A lightweight keyword check (`src/lib/safety.ts`) flags possible
  crisis language — it **never** blocks or hides a post by itself, it only
  (a) shows the poster crisis resources immediately and (b) opens a
  moderation-queue item. Community guidelines: `/guidelines`. Crisis
  resources: `/safety`.
- RLS is enforced in Postgres, not just hidden in the UI — see the policies
  in `supabase/schema.sql`. Real name/email is never stored anywhere a
  public API can read; `profiles` has zero PII by construction.

## What's deliberately out of scope here

This is a complete, working implementation of everything in the brief, but
a few things are flagged as "next steps you'd want before real scale" in
code comments rather than fully built out: realtime feed updates
(currently `router.refresh()` after posting), a proper ML-based
content-safety classifier (the keyword check is a real but minimal stand-in
with the right workflow shape), and generated Supabase TypeScript types
(this repo hand-writes `src/types/database.ts` to match `schema.sql` since
there's no live project to generate against — swap in `supabase gen types`
once you have one).
