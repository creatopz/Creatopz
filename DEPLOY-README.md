# Creatopz — deployable build

Upload the whole contents of this folder to any static host (Netlify drop,
Vercel, GitHub Pages, Hostinger, cPanel public_html). No build step.

## New animated pages (self-contained, mock data)
- index.html ................ animated landing page
- directory.html ............ creator directory (search / filter / sort)
- play.html ................. ASMR arcade (3 toys, WebAudio sound)
- auth.html ................. log in + 3-step sign up
- dashboard-creator.html .... creator dashboard
- dashboard-brand.html ...... brand dashboard — post campaigns, review + shortlist applicants
- profile.html .............. public creator profile
- admin-console.html ........ admin console (applications, creators, campaigns, gallery)

These require support.js (included, same folder). They ship with realistic
sample data — no database calls yet.

## Your original Supabase-wired pages (unchanged)
login.html, signup.html, forgot-password.html, reset-password.html,
creators.html, campaigns.html, gallery.html, admin.html,
creator-dashboard.html, brand-dashboard.html, creator-onboarding.html,
brand-onboarding.html, terms.html, privacy.html, legacy-home.html
(your previous landing page), plus css/, js/, assets/, supabase/,
robots.txt, sitemap.xml, og-image.png, .env.example, README.md.

- dashboard-brand.html ...... brand dashboard — post campaigns, review + shortlist applicants

## Going live with real data
1. In the Supabase SQL editor, run in this exact order:
   schema.sql → migration_002_admin_mediation.sql →
   migration_003_audience_gender_split.sql → migration_004_gallery.sql →
   migration_005_lock_admin_role.sql → seed.sql (seed.sql optional, sample rows only).
2. js/supabase-client.js already has your project URL + anon key wired in —
   nothing to change there. Never put the service_role key in any browser file.
3. Sign up once through auth.html (or login.html) using creatopz.in@gmail.com.
   Then re-run step 3 of migration_005 in the SQL editor to promote that one
   account to admin. No other account can ever become admin — it's enforced
   by a database trigger, not just hidden UI.
4. The original Supabase-wired pages (login/signup/creators/campaigns/gallery/
   admin/creator-dashboard/brand-dashboard/onboarding) work against live data
   immediately after step 1-2.
5. The new animated pages (index/directory/play/auth/dashboard-creator/
   dashboard-brand/profile/admin-console) currently render realistic sample
   data. To wire them to Supabase, replace the seed arrays at the top of each
   page's logic script (APPS / CREATORS / CAMPAIGNS / PEOPLE / SEED) with
   supabaseClient.from(...).select(...) calls using the same field names, and
   add js/supabase-client.js + the Supabase CDN script tag to each page's
   <head>. This is a developer task — hand this repo + migration files to a
   dev or Claude Code for that pass if you want it done end-to-end.

## Security notes already built into the migrations
- A user can never set their own role to 'admin' (DB trigger, not just RLS).
- Only the email creatopz.in@gmail.com can ever hold role='admin' (migration_005).
- Creators/brands only see their own private data; public directory/gallery
  go through safe views (creators_public, brands_public, campaigns_public)
  that exclude contact info, rates and budgets.
- Only admin can finalize ("accept") an application — creators can withdraw,
  brands can shortlist/reject, admin closes the loop (migration_002).
- Storage policies restrict avatar/logo uploads to the owner's own folder;
  gallery uploads are admin-only.
