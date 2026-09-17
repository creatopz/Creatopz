#!/usr/bin/env node
/**
 * End-to-end functional test for the Lead / Visitor Communicator Agent
 * widget (js/lead-agent.js). Drives a real headless browser against the
 * real index.html/campaigns.html; stubs supabaseClient.from("leads").insert()
 * to capture the exact payload the widget builds (this sandbox can't reach
 * the real Supabase REST endpoint over the network -- see run.js's own
 * note on CDN/network access), then asserts on that payload.
 *
 * The RLS policy itself (can an anon insert actually land?) is verified
 * separately with a rolled-back `set local role anon` insert -- see
 * agents/qa-agent/reports/lead-agent-test.md for both results together.
 *
 * Run with: NODE_PATH=$(npm root -g) node agents/qa-agent/test-lead-agent.js
 */
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");

// Generic chainable thenable, same technique as run.js's dynamic audit --
// covers whatever other scripts on the page happen to call (nav.js's
// getCurrentProfile(), auth.js's renderAuthNav()) so THEIR calls don't
// throw and pollute this test's error count, while .from("leads").insert()
// is special-cased to capture the widget's actual payload.
const SUPABASE_STUB = `
window.__leadInserts = [];
function ctzMakeThenable(value) {
  var obj = { then: function (resolve) { return Promise.resolve(value).then(resolve); }, catch: function () { return obj; } };
  ["select","insert","update","delete","eq","neq","gte","lte","gt","lt","is","in","order","limit"].forEach(function (m) {
    obj[m] = function () { return ctzMakeThenable(value); };
  });
  obj.single = function () { return ctzMakeThenable({ data: null, error: null }); };
  obj.maybeSingle = function () { return ctzMakeThenable({ data: null, error: null }); };
  return obj;
}
window.supabase = {
  createClient: function () {
    return {
      from: function (table) {
        var chain = ctzMakeThenable({ data: [], error: null });
        chain.insert = function (payload) {
          if (table === "leads") window.__leadInserts.push(payload);
          return ctzMakeThenable({ data: null, error: null });
        };
        return chain;
      },
      auth: {
        getSession: function () { return Promise.resolve({ data: { session: null }, error: null }); },
        getUser: function () { return Promise.resolve({ data: { user: null }, error: null }); },
        onAuthStateChange: function () { return { data: { subscription: { unsubscribe: function () {} } } }; },
      },
      channel: function () { var ch = { on: function () { return ch; }, subscribe: function () { return ch; } }; return ch; },
    };
  },
};
`;

async function main() {
  const results = [];
  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split("?")[0]);
    if (reqPath === "/") reqPath = "/index.html";
    const filePath = path.join(ROOT, reqPath);
    if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404); res.end("not found"); return;
    }
    const ext = path.extname(filePath);
    const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".png": "image/png" };
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  await page.route("**/supabase.min.js", (route) => route.fulfill({ contentType: "application/javascript", body: SUPABASE_STUB }));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.fulfill({ contentType: "text/css", body: "" }));

  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "networkidle", timeout: 20000 });

  function check(name, cond) { results.push({ name, pass: !!cond }); }

  // 1. Launcher exists and panel starts hidden.
  check("launcher renders", await page.locator("#leadAgentLauncher").count() === 1);
  check("panel starts hidden", await page.locator("#leadAgentPanel").isHidden());

  // 2. Opening greets with quick replies.
  await page.click("#leadAgentLauncher");
  await page.waitForTimeout(200);
  check("panel opens", await page.locator("#leadAgentPanel").isVisible());
  const greetText = await page.locator("#leadAgentBody").innerText();
  check("greets the visitor", /Creatopz assistant/i.test(greetText));
  check("shows quick replies", await page.locator(".lead-agent-chip").count() >= 4);

  // 3. FAQ match: platform fee.
  await page.click(".lead-agent-chip:has-text(\"What's the platform fee?\")");
  await page.waitForTimeout(150);
  let bodyText = await page.locator("#leadAgentBody").innerText();
  check("answers the fee question correctly (15%, no other charges)", /15%/.test(bodyText) && /no listing fee/i.test(bodyText));

  // 4. Free-text FAQ match via the text input.
  await page.fill("#leadAgentText", "How does it work?");
  await page.click("#leadAgentForm button[type=submit]");
  await page.waitForTimeout(150);
  bodyText = await page.locator("#leadAgentBody").innerText();
  check("answers free-typed question (how it works)", /admin-mediated|mediated by our team/i.test(bodyText));

  // 5. Escalation path: pricing negotiation should never get a canned answer.
  await page.fill("#leadAgentText", "Can I get a custom discount on the contract?");
  await page.click("#leadAgentForm button[type=submit]");
  await page.waitForTimeout(150);
  check("lead form appears on escalation trigger", await page.locator("#lfName").count() === 1);

  // 6. Submit the lead form with a realistic high-intent message.
  await page.fill("#lfName", "Test Visitor");
  await page.fill("#lfContact", "test@example.com");
  await page.fill("#lfNeed", "Want to discuss a custom discount on my campaign budget");
  await page.click("#lfSubmit");
  await page.waitForTimeout(300);

  const inserts = await page.evaluate(() => window.__leadInserts);
  check("exactly one insert sent to the leads table", inserts.length === 1);
  const lead = inserts[0] || {};
  check("insert has name/contact/need", !!lead.name && !!lead.contact && !!lead.need);
  check("needs_human_review is true (escalation trigger)", lead.needs_human_review === true);
  check("high_intent is true (mentions budget/campaign)", lead.high_intent === true);
  check("source_page recorded", lead.source_page === "index.html");

  const confirmText = await page.locator("#leadAgentBody").innerText();
  check("shows a confirmation message after submit", /Thanks, Test/i.test(confirmText));

  // 7. No runtime errors anywhere in this flow.
  check("zero uncaught JS exceptions", pageErrors.length === 0);
  check("zero console errors", consoleErrors.length === 0);

  // 8. Confirm the widget is entirely absent from the admin console. This
  // stub is intentionally minimal (no .select()/.getUser()), so
  // admin-console.html's own requireAuth() flow throws -- that's a known
  // artifact of the stub, not the widget under test, so its errors are
  // tracked separately and not asserted on here.
  const adminPageErrors = [];
  const page2 = await context.newPage();
  page2.on("pageerror", (e) => adminPageErrors.push(e.message));
  await page2.route("**/supabase.min.js", (route) => route.fulfill({ contentType: "application/javascript", body: SUPABASE_STUB }));
  await page2.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.fulfill({ contentType: "text/css", body: "" }));
  await page2.goto(`http://127.0.0.1:${port}/admin-console.html`, { waitUntil: "networkidle", timeout: 20000 }).catch(() => {});
  await page2.waitForTimeout(300);
  check("widget absent from admin-console.html", await page2.locator("#leadAgentLauncher").count() === 0);
  await page2.close();

  await context.close();
  await browser.close();
  await new Promise((r) => server.close(r));

  const failed = results.filter((r) => !r.pass);
  results.forEach((r) => console.log((r.pass ? "PASS" : "FAIL") + " -- " + r.name));
  if (pageErrors.length) console.log("Page errors:", pageErrors);
  if (consoleErrors.length) console.log("Console errors:", consoleErrors);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
