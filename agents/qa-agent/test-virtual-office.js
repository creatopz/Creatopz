#!/usr/bin/env node
/**
 * Functional test for the Virtual Office dashboard added to
 * admin-console.html -- drives a real headless browser against the real
 * page with a stubbed Supabase client (admin session + realistic
 * leads/agent_reports rows), since admin-console.html is gated by
 * requireAuth("admin") and this sandbox has no real session to give it.
 *
 * Run with: NODE_PATH=$(npm root -g) node agents/qa-agent/test-virtual-office.js
 */
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");

const FAKE_LEADS = [
  { id: "l1", name: "Priya Sharma", contact: "priya@brandco.in", need: "Want to discuss a custom discount on our campaign budget", source_page: "for-brands.html", high_intent: true, needs_human_review: true, status: "new", created_at: new Date().toISOString() },
  { id: "l2", name: "Rahul Verma", contact: "rahul@example.com", need: "How do I apply as a creator?", source_page: "index.html", high_intent: false, needs_human_review: false, status: "contacted", created_at: new Date().toISOString() },
];
const FAKE_REPORTS = [
  { id: "r1", agent_name: "QA / Bug Detection Agent", run_at: new Date().toISOString(), summary: "3 findings — 0 critical, 0 high, 1 medium, 2 low.", severity_counts: { Critical: 0, High: 0, Medium: 1, Low: 2 }, findings: [{ severity: "Medium", category: "SEO/meta", file: "test.html", line: null, description: "Missing meta description." }], needs_human_review: false },
];

function buildStub() {
  return `
window.__leadUpdates = [];
function ctzThenable(value) {
  var obj = { then: function (resolve) { return Promise.resolve(value).then(resolve); }, catch: function () { return obj; } };
  ["select","insert","update","delete","eq","neq","gte","lte","gt","lt","is","in","order","limit"].forEach(function (m) {
    obj[m] = function () { return ctzThenable(value); };
  });
  obj.single = function () { return ctzThenable({ data: null, error: null }); };
  obj.maybeSingle = function () { return ctzThenable({ data: null, error: null }); };
  return obj;
}
window.supabase = {
  createClient: function () {
    return {
      from: function (table) {
        if (table === "profiles") {
          // select()/eq() must keep returning THIS object (not a fresh
          // generic thenable), or the .single() override below gets lost
          // partway down the chain and getCurrentProfile() sees null.
          var profilesChain = {
            select: function () { return profilesChain; },
            eq: function () { return profilesChain; },
            single: function () { return ctzThenable({ data: { id: "admin-1", role: "admin", email: "admin@test.com" }, error: null }); },
            maybeSingle: function () { return ctzThenable({ data: { id: "admin-1", role: "admin", email: "admin@test.com" }, error: null }); },
          };
          return profilesChain;
        }
        if (table === "leads") {
          var chain = ctzThenable({ data: ${JSON.stringify(FAKE_LEADS)}, error: null });
          chain.update = function (patch) {
            window.__leadUpdates.push(patch);
            return ctzThenable({ data: null, error: null });
          };
          return chain;
        }
        if (table === "agent_reports") {
          return ctzThenable({ data: ${JSON.stringify(FAKE_REPORTS)}, error: null });
        }
        return ctzThenable({ data: [], error: null });
      },
      auth: {
        getUser: function () { return Promise.resolve({ data: { user: { id: "admin-1", email: "admin@test.com" } }, error: null }); },
        getSession: function () { return Promise.resolve({ data: { session: { user: { id: "admin-1" } } }, error: null }); },
        onAuthStateChange: function () { return { data: { subscription: { unsubscribe: function () {} } } }; },
        signOut: function () { return Promise.resolve({ error: null }); },
      },
      channel: function () { var ch = { on: function () { return ch; }, subscribe: function () { return ch; } }; return ch; },
    };
  },
};
`;
}

async function main() {
  const results = [];
  function check(name, cond) { results.push({ name, pass: !!cond }); }

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
  await page.route("**/supabase.min.js", (route) => route.fulfill({ contentType: "application/javascript", body: buildStub() }));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.fulfill({ contentType: "text/css", body: "" }));

  await page.goto(`http://127.0.0.1:${port}/admin-console.html`, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(400);

  check("stays on admin-console.html (admin session accepted)", page.url().includes("admin-console.html"));
  check("Virtual Office nav link exists", await page.locator('[data-view="agents"]').count() >= 1);
  check("review badge shows 1 (one needs_human_review+new lead)", (await page.locator("#countAgentReview").innerText()) === "1");

  await page.locator('.dash-nav [data-view="agents"]').click();
  await page.waitForTimeout(200);

  check("Virtual Office view is visible", await page.locator("#view-agents").isVisible());
  check("review queue shows the pending lead", (await page.locator("#agentReviewList").innerText()).includes("Priya Sharma"));
  check("review queue flags high intent", (await page.locator("#agentReviewList").innerText()).includes("High intent"));
  check("6 agent roster cards render", await page.locator("#agentStatusGrid .admin-card").count() === 6);
  check("2 agents show Live, 4 show Planned", (await page.locator("#agentStatusGrid").innerText()).match(/Live/g)?.length === 2 && (await page.locator("#agentStatusGrid").innerText()).match(/Planned/g)?.length === 4);
  check("QA report summary renders", (await page.locator("#qaReportBody").innerText()).includes("3 findings"));
  check("QA report findings table has 1 row", await page.locator("#qaReportBody tbody tr").count() === 1);
  check("leads table lists both leads", (await page.locator("#leadsBody").innerText()).includes("Priya Sharma") && (await page.locator("#leadsBody").innerText()).includes("Rahul Verma"));

  // Mark the pending lead contacted and confirm the update call + UI refresh.
  await page.locator('#agentReviewList .lead-mark-btn[data-status="contacted"]').click();
  await page.waitForTimeout(300);
  const updates = await page.evaluate(() => window.__leadUpdates);
  check("marking contacted sent the right update", updates.length === 1 && updates[0].status === "contacted");

  check("zero uncaught JS exceptions", pageErrors.length === 0);
  check("zero console errors", consoleErrors.length === 0);

  await context.close();
  await browser.close();
  await new Promise((r) => server.close(r));

  results.forEach((r) => console.log((r.pass ? "PASS" : "FAIL") + " -- " + r.name));
  if (pageErrors.length) console.log("Page errors:", pageErrors);
  if (consoleErrors.length) console.log("Console errors:", consoleErrors);
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
