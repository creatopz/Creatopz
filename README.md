# Creatopz — Setup Guide

Your static site is now a real Supabase-backed creator/brand marketplace.
No build step — every page is plain HTML/CSS/JS.

## 1. Create your Supabase project

1. Go to https://supabase.com → New project.
2. Wait for it to finish provisioning.

## 2. Run the database schema

1. Open **SQL Editor** in the Supabase dashboard.
2. Paste the entire contents of `supabase/schema.sql` and run it.
   This creates all tables, indexes, and Row Level Security policies.
3. If you already have a live project (not a fresh one), also run any
   `supabase/migration_*.sql` files you haven't applied yet, in order —
   each one is additive and safe to run on real data.

## 3. Create the storage buckets

1. Go to **Storage** → **New bucket**.
2. Create a bucket named `creator-avatars`, set it **Public**.
3. Create a second bucket named `brand-logos`, set it **Public**.
4. Create a third bucket named `gallery`, set it **Public** — this holds the admin-managed Instagram-style gallery images (`gallery.html`, managed from `admin.html`).
5. The storage policies at the bottom of `schema.sql` already cover all three buckets (they run as part of the same script).

## 4. Connect the frontend

1. Go to **Project Settings → API**.
2. Copy the **Project URL** and **anon public** key.
3. Open `js/supabase-client.js` and paste them in:
   ```js
   const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
   const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
   ```
4. Never paste the `service_role` key anywhere in this project — the
   anon key is the only one safe to expose in browser code.

## 5. (Optional) Load demo data

Run `supabase/seed.sql` in the SQL Editor to add a few fake public
creator profiles so the directory isn't empty while you build. Delete
these rows before launch — they have no real login attached.

## 6. Create your first admin

1. Sign up normally through `signup.html` (either role).
2. In the SQL Editor, run:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Log out and back in, then visit `admin.html`.

## 7. Deploy

Any static host works (Netlify, Vercel, GitHub Pages, S3, etc.) since
there's no server-side code — just make sure `js/supabase-client.js`
has your real project values before you deploy.

---

## Project structure

```
index.html                 Marketing site (unchanged visual identity)
creators.html               Public creator directory (Supabase-powered)
campaigns.html              Public campaign marketplace
gallery.html                Public Instagram-style gallery (admin-managed)
signup.html / login.html    Auth
forgot-password.html / reset-password.html
creator-onboarding.html     Creator profile builder
creator-dashboard.html      Creator overview, applications, notifications
brand-onboarding.html       Brand company profile
brand-dashboard.html        Brand overview, post campaign, manage applications
admin.html                  Verify/hide creators, close campaigns

css/app.css                 Shared styles for auth pages & dashboards
js/supabase-client.js       Supabase client config (put your keys here)
js/auth.js                  Signup/login/logout/password reset/role guards
js/utils.js                 Toasts, loading states, formatting helpers
js/creators.js              Public directory: fetch/filter/search/modal
js/campaigns.js             Public campaign feed + apply flow
js/dashboard.js             Onboarding forms, image upload, campaign CRUD,
                            applications, notifications

supabase/schema.sql         Full DB schema + RLS policies + storage policies
supabase/seed.sql           Optional demo data
.env.example                Where to find your Supabase keys
```

## How it fits together

**Creator flow:** Website → Join as a creator → Signup (role: creator) →
Creator onboarding (builds `creators` row + uploads avatar to
`creator-avatars`) → Dashboard → profile appears in `creators.html` once
`is_public = true` → browse `campaigns.html` → Apply → status tracked on
dashboard → notified on accept/reject.

**Brand flow:** Website → Post a campaign → Signup (role: brand) →
Company profile (builds `brands` row + logo upload) → Dashboard → Post
campaign (status: draft or open) → open campaigns show in
`campaigns.html` → view applications → Accept/Reject → creator notified.

## Security notes

- All authorization is enforced by **Postgres Row Level Security**, not
  just the frontend — see the policies in `schema.sql`. A user cannot
  edit another user's `creators`/`brands` row, cannot create a campaign
  under someone else's `brand_id`, and cannot apply twice to the same
  campaign (unique constraint).
- `is_verified` on creators should only ever be flipped by an admin —
  the creator dashboard never sends that field in its update payload.
  For stricter enforcement, you can split verification into a separate
  admin-only table/RPC in a follow-up.
- No `service_role` key exists anywhere in this codebase.

## Testing checklist

**Authentication**
- [ ] Creator signup (check confirmation email if enabled)
- [ ] Brand signup
- [ ] Login with correct / incorrect credentials
- [ ] Logout
- [ ] Forgot password → reset link → new password → login

**Creator**
- [ ] Create profile, upload avatar, save
- [ ] Edit profile, replace avatar
- [ ] Profile appears in `creators.html` when `is_public` is checked
- [ ] Uncheck "list in directory" → profile disappears from directory
- [ ] Filter/search/sort the directory

**Brand**
- [ ] Create company profile, upload logo
- [ ] Post a campaign as draft (not visible publicly)
- [ ] Publish a campaign (status: open) → appears in `campaigns.html`
- [ ] Edit/close a campaign

**Applications**
- [ ] Creator applies to an open campaign
- [ ] Duplicate application is blocked (button becomes "Applied")
- [ ] Brand sees the application in their dashboard
- [ ] Accept → creator dashboard shows "accepted" + gets a notification
- [ ] Reject → creator sees "rejected"

**Security (should all fail)**
- [ ] Editing another creator's profile via the API
- [ ] Editing another brand's campaign
- [ ] Creating a campaign under a `brand_id` you don't own
- [ ] Applying twice to the same campaign
- [ ] Non-admin visiting `admin.html` (redirects to their own dashboard)
