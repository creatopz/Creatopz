/**
 * Error monitoring (Sentry) — currently INACTIVE.
 *
 * SETUP (2 minutes):
 * 1. Create a free account at https://sentry.io
 * 2. Create a new project → pick "Browser JavaScript"
 * 3. Copy the DSN it gives you (looks like https://xxxx@xxxx.ingest.sentry.io/xxxx)
 * 4. Paste it into SENTRY_DSN below
 * 5. Add this line to the <head> of every page, right after your other <script> tags:
 *      <script src="https://browser.sentry-cdn.com/7.120.0/bundle.tracing.min.js"></script>
 *      <script src="js/error-monitoring.js"></script>
 *
 * Once the DSN is set, this file activates automatically — no other code changes needed.
 * Until then, it does nothing (safe to leave in place).
 */

const SENTRY_DSN = ""; // <-- paste your DSN here

if (SENTRY_DSN && window.Sentry) {
  window.Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    environment: window.location.hostname === "creatopz.in" ? "production" : "development",
  });
}
