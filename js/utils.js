/**
 * Shared helpers used across pages: toasts, button loading states,
 * simple formatting, and small DOM utilities.
 */

function showToast(message, type = "info") {
  let host = document.getElementById("toastHost");
  if (!host) {
    host = document.createElement("div");
    host.id = "toastHost";
    host.style.cssText =
      "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);" +
      "z-index:200;display:flex;flex-direction:column;gap:8px;align-items:center;" +
      "width:100%;max-width:420px;padding:0 16px;";
    document.body.appendChild(host);
  }
  const el = document.createElement("div");
  // Strict monochrome + red palette: info/success both read as solid
  // black (the message text itself carries the distinction), error is
  // the site's one accent red -- no other hues in a toast, ever.
  const colors = {
    info: "#000000",
    success: "#000000",
    error: "#e7473c",
  };
  el.textContent = message;
  el.style.cssText =
    `background:${colors[type] || colors.info};color:#fff;padding:13px 20px;` +
    "border-radius:999px;font-family:'Inter',sans-serif;font-size:14px;font-weight:600;" +
    "box-shadow:0 16px 40px -14px rgba(0,0,0,0.45);width:auto;max-width:100%;text-align:center;" +
    "animation:toastIn .25s cubic-bezier(.16,1,.3,1);";
  host.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .3s ease";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

function setButtonLoading(btn, loading, loadingText = "Saving...") {
  if (!btn) return;
  if (loading) {
    btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
    btn.textContent = loadingText;
    btn.disabled = true;
    btn.style.opacity = "0.7";
    btn.style.cursor = "not-allowed";
  } else {
    btn.textContent = btn.dataset.originalText || btn.textContent;
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
  }
}

function friendlyAuthError(error) {
  if (!error) return "Something went wrong. Please try again.";
  const msg = (error.message || "").toLowerCase();
  if (msg.includes("already registered") || msg.includes("already been registered")) {
    return "That email is already registered. Try logging in instead.";
  }
  if (msg.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please confirm your email before logging in.";
  }
  if (msg.includes("password") && msg.includes("least")) {
    return "Password is too weak — use at least 6 characters.";
  }
  if (msg.includes("expired")) {
    return "That link has expired. Please request a new one.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Network error — check your connection and try again.";
  }
  if (msg.includes("row-level security") || msg.includes("permission denied")) {
    // The DB correctly refused the write, but the raw Postgres message
    // is meaningless to a user — this almost always means the page had
    // stale data (e.g. a campaign closed after it was loaded).
    return "That didn't go through — the page may be out of date. Please refresh and try again.";
  }
  if (msg.includes("duplicate key")) {
    // Postgres' unique-violation message names the constraint (e.g.
    // "...violates unique constraint \"creators_username_key\"") --
    // worth a specific message for the one users hit by choice
    // (picking a username), not just by coincidence of re-clicking.
    if (msg.includes("username")) {
      return "That username is already taken — try a different one.";
    }
    return "You've already done that.";
  }
  // Never show a raw database/Postgres error to a user.
  if (error.code || msg.includes("violates") || msg.includes("constraint")) {
    return "Something went wrong saving that. Please refresh and try again.";
  }
  return error.message || "Something went wrong. Please try again.";
}

// ---------- Platform fee ----------
// Creatopz doesn't process payments itself (admin mediates every deal
// off-platform) -- this is a business term shown consistently wherever
// a budget is entered or reviewed, not a stored/charged amount. Kept in
// one place so the brand's post-campaign form, the team builder's
// allocatable pool, and admin's view of a campaign's budget can never
// drift out of sync on what "15%" means.
const PLATFORM_FEE_PCT = 0.15;
function feeBreakdown(totalBudget) {
  const total = Number(totalBudget) || 0;
  const fee = Math.round(total * PLATFORM_FEE_PCT);
  return { total, fee, net: total - fee };
}

// ---------- Rate card ----------
// A creator's rate_card is `[{type, rate}]`. One shared renderer so
// admin's Applications/Creators tabs and a brand's Applicants/Saved
// creators views all show the exact same breakdown, not three
// re-implementations that could quietly disagree.
// Escapes each type name itself (not just the caller's surrounding
// markup) since this string is built for direct innerHTML use and a
// creator's rate-card type is their own free text.
function rateCardSummary(rateCard) {
  if (!Array.isArray(rateCard) || !rateCard.length) return "Rate card not published";
  return rateCard.map((r) => `${escapeHtml(r.type)}: ₹${Number(r.rate).toLocaleString("en-IN")}`).join(" · ");
}

// ---------- Shareable score card ----------
// Draws a 1080x1350 (IG-feed-ratio) card onto a <canvas> the caller
// supplies, matching the site's palette (White Smoke / bright red /
// black). Async because it waits on document.fonts.ready first --
// canvas text draws with whatever font is loaded at call time, and the
// site's display font loads via a Google Fonts @import that may not
// have resolved yet on a fast click right after page load.
async function renderScoreCard(canvas, { name, score, ratingsCount, niche }) {
  await document.fonts.ready;
  const W = 1080, H = 1350;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, W, H);

  // Wordmark
  ctx.fillStyle = "#000";
  ctx.font = "800 40px 'Bricolage Grotesque', sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Creatopz", 80, 130);
  ctx.fillStyle = "#e7473c";
  ctx.beginPath();
  ctx.arc(80 + ctx.measureText("Creatopz").width + 22, 108, 7, 0, Math.PI * 2);
  ctx.fill();

  // Big score
  const scoreLabel = score ? Number(score).toFixed(1) : "—";
  ctx.fillStyle = "#000";
  ctx.font = "800 300px 'Bricolage Grotesque', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(scoreLabel, W / 2, 660);
  ctx.font = "700 44px 'Inter', sans-serif";
  ctx.fillStyle = "#7d7d7d";
  ctx.fillText("out of 5", W / 2, 730);

  // Label
  ctx.fillStyle = "#e7473c";
  ctx.font = "800 34px 'Inter', sans-serif";
  ctx.fillText("C R E A T O P Z   S C O R E", W / 2, 830);

  // Divider
  ctx.strokeStyle = "#dcdcdc";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(240, 900);
  ctx.lineTo(W - 240, 900);
  ctx.stroke();

  // Name + niche
  ctx.fillStyle = "#000";
  ctx.font = "700 54px 'Bricolage Grotesque', sans-serif";
  ctx.fillText(name || "Creator", W / 2, 990);
  ctx.fillStyle = "#4a4a4a";
  ctx.font = "500 34px 'Inter', sans-serif";
  ctx.fillText(niche || "Creator", W / 2, 1045);

  // Footer
  ctx.fillStyle = "#7d7d7d";
  ctx.font = "600 30px 'Inter', sans-serif";
  const based = ratingsCount === 1 ? "Based on 1 collab" : `Based on ${ratingsCount || 0} collabs`;
  ctx.fillText(based + " · creatopz.in", W / 2, H - 90);

  ctx.textAlign = "left";
}

// ---------- Shareable "Selected" badge ----------
// Same card format/palette as renderScoreCard() -- a creator lands a
// brief, this is the congratulatory image for their Story/feed. Pure
// UI over data that already exists (an accepted application); no new
// table backs this.
async function renderSelectedBadge(canvas, { creatorName, campaignTitle, brandName, niche }) {
  await document.fonts.ready;
  const W = 1080, H = 1350;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, W, H);

  // Wordmark
  ctx.fillStyle = "#000";
  ctx.font = "800 40px 'Bricolage Grotesque', sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Creatopz", 80, 130);
  ctx.fillStyle = "#e7473c";
  ctx.beginPath();
  ctx.arc(80 + ctx.measureText("Creatopz").width + 22, 108, 7, 0, Math.PI * 2);
  ctx.fill();

  // Big label
  ctx.fillStyle = "#e7473c";
  ctx.font = "800 34px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("I ' M   S E L E C T E D", W / 2, 420);
  ctx.fillStyle = "#000";
  ctx.font = "800 90px 'Bricolage Grotesque', sans-serif";
  wrapCenteredText(ctx, campaignTitle || "a new brief", W / 2, 540, 880, 96);

  ctx.fillStyle = "#4a4a4a";
  ctx.font = "600 38px 'Inter', sans-serif";
  ctx.fillText("with " + (brandName || "a brand") + " · via Creatopz", W / 2, 800);

  // Divider
  ctx.strokeStyle = "#dcdcdc";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(240, 900);
  ctx.lineTo(W - 240, 900);
  ctx.stroke();

  // Name + niche
  ctx.fillStyle = "#000";
  ctx.font = "700 54px 'Bricolage Grotesque', sans-serif";
  ctx.fillText(creatorName || "Creator", W / 2, 990);
  ctx.fillStyle = "#4a4a4a";
  ctx.font = "500 34px 'Inter', sans-serif";
  ctx.fillText(niche || "Creator", W / 2, 1045);

  // Footer
  ctx.fillStyle = "#7d7d7d";
  ctx.font = "600 30px 'Inter', sans-serif";
  ctx.fillText("creatopz.in", W / 2, H - 90);

  ctx.textAlign = "left";
}

// Wraps a single string across up to 3 centered lines of a given
// max width, shrinking to fit rather than overflowing -- campaign
// titles are free text of very variable length.
function wrapCenteredText(ctx, text, cx, startY, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const capped = lines.slice(0, 3);
  const offset = ((capped.length - 1) * lineHeight) / 2;
  capped.forEach((l, i) => ctx.fillText(l, cx, startY - offset + i * lineHeight));
}

function formatNumber(n) {
  if (n === null || n === undefined || n === "") return "—";
  const num = Number(n);
  if (isNaN(num)) return "—";
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(num);
}

function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- Doodle avatar (creator hasn't uploaded a photo) ----------
// A tiny abstract face -- hand-drawn-style head outline, dot eyes, a
// curved mouth, one accent-colored spark for character -- in the same
// line-doodle language as the auth.html illustration, deterministically
// seeded off the creator's own id/name so it's stable across reloads and
// unique per person. Background is always a full-bleed rect, not a
// circle, so it fills whatever shape the container's own CSS clips it to
// (circular avatar, 4:5 card photo, ...).
function seedFromString(str) {
  let h = 0;
  const s = String(str || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
function doodleAvatarSVG(seed) {
  const rand = seededRandom(seedFromString(seed));

  // Head: an off-center, slightly organic blob rather than a perfect
  // circle -- two overlapping circles read as one hand-drawn outline.
  const headR = 11 + rand() * 1.5;
  const headCx = 20 + (rand() - 0.5) * 1.5;
  const headCy = 20 + (rand() - 0.5) * 1.5;
  const bumpAngle = rand() * Math.PI * 2;
  const bumpR = headR * (0.55 + rand() * 0.15);
  const bumpCx = headCx + Math.cos(bumpAngle) * headR * 0.55;
  const bumpCy = headCy + Math.sin(bumpAngle) * headR * 0.35;

  // Eyes: dots, seeded spacing/size/asymmetry for a hand-drawn feel.
  const eyeSpacing = 3.6 + rand() * 1.8;
  const eyeY = headCy - 1.5 + (rand() - 0.5) * 2;
  const eyeR = 1 + rand() * 0.6;
  const eyeTiltL = (rand() - 0.5) * 1.2;
  const eyeTiltR = (rand() - 0.5) * 1.2;

  // Mouth: a simple curve -- weighted toward a smile (friendlier for a
  // creator marketplace), occasionally neutral or a small smirk.
  const mouthMood = rand();
  const mouthY = headCy + 4 + (rand() - 0.5) * 1.5;
  const mouthHalfWidth = 3 + rand() * 1.5;
  const mouthCurve = mouthMood < 0.65 ? 2.5 + rand() * 2 : mouthMood < 0.85 ? 0 : -(1.5 + rand());
  const mouthPath = `M${(headCx - mouthHalfWidth).toFixed(1)},${mouthY.toFixed(1)} Q${headCx.toFixed(1)},${(mouthY + mouthCurve).toFixed(1)} ${(headCx + mouthHalfWidth).toFixed(1)},${mouthY.toFixed(1)}`;

  // One accent-colored spark near the head -- the single pop of red the
  // rest of the site reserves for one emphasized detail per element.
  const sparkAngle = rand() * Math.PI * 2;
  const sparkDist = headR + 2.5;
  const sparkCx = headCx + Math.cos(sparkAngle) * sparkDist;
  const sparkCy = headCy + Math.sin(sparkAngle) * sparkDist;
  const sparkSize = 1.3 + rand() * 0.8;

  return `<svg viewBox="0 0 40 40" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style="display:block;" aria-hidden="true">
    <rect width="40" height="40" style="fill:var(--surface-2);" />
    <circle cx="${headCx.toFixed(1)}" cy="${headCy.toFixed(1)}" r="${headR.toFixed(1)}" style="fill:none;stroke:var(--ink);stroke-width:1.6;" />
    <circle cx="${bumpCx.toFixed(1)}" cy="${bumpCy.toFixed(1)}" r="${bumpR.toFixed(1)}" style="fill:none;stroke:var(--ink);stroke-width:1.6;" />
    <circle cx="${(headCx - eyeSpacing / 2 + eyeTiltL).toFixed(1)}" cy="${eyeY.toFixed(1)}" r="${eyeR.toFixed(1)}" style="fill:var(--ink);" />
    <circle cx="${(headCx + eyeSpacing / 2 + eyeTiltR).toFixed(1)}" cy="${eyeY.toFixed(1)}" r="${eyeR.toFixed(1)}" style="fill:var(--ink);" />
    <path d="${mouthPath}" style="fill:none;stroke:var(--ink);stroke-width:1.4;stroke-linecap:round;" />
    <path d="M${(sparkCx - sparkSize).toFixed(1)},${sparkCy.toFixed(1)} L${(sparkCx + sparkSize).toFixed(1)},${sparkCy.toFixed(1)} M${sparkCx.toFixed(1)},${(sparkCy - sparkSize).toFixed(1)} L${sparkCx.toFixed(1)},${(sparkCy + sparkSize).toFixed(1)}" style="stroke:var(--accent);stroke-width:1.4;stroke-linecap:round;" />
  </svg>`;
}
// className/styleExtra should match whatever the real <img> would have
// carried (e.g. "cc-photo avatar-fallback", "font-size:44px;") so the
// doodle drops into the exact same slot.
function doodleAvatarHTML(seed, className, styleExtra) {
  return `<div class="${className}" style="overflow:hidden;${styleExtra || ""}">${doodleAvatarSVG(seed)}</div>`;
}
// For onerror="" handlers on an <img> that already tried a real photo
// and failed to load -- swaps the broken <img> for the same doodle.
function replaceWithDoodleAvatar(imgEl, seed, className, styleExtra) {
  const div = document.createElement("div");
  div.className = className;
  div.style.cssText = "overflow:hidden;" + (styleExtra || "");
  div.innerHTML = doodleAvatarSVG(seed);
  imgEl.replaceWith(div);
}

// Guards against a stray "javascript:"/"data:" value sneaking into an
// href from a free-text field (Instagram URL, brand website, ...) --
// only http(s) URLs make it through; a bare domain like "site.com" gets
// "https://" added rather than rejected.
function safeExternalUrl(url) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  try {
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : "https://" + trimmed;
    const parsed = new URL(withScheme);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.href;
  } catch {
    return null;
  }
}

// Renders "Label ↗" links for whichever [label, url] pairs actually have
// a usable URL -- used to show a brand's website/social handles wherever
// they're safe to reveal to creators (once connected, or on public briefs).
function socialLinksHtml(entries) {
  const links = entries.map(([label, url]) => [label, safeExternalUrl(url)]).filter(([, href]) => href);
  if (!links.length) return "";
  return links
    .map(([label, href]) => `<a href="${href}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline;text-underline-offset:2px;">${escapeHtml(label)} ↗</a>`)
    .join(" · ");
}

// ---------- Password show/hide toggle ----------
// Wrap a password <input> in <div class="password-field"> and add
// <button type="button" class="password-toggle" data-target="INPUT_ID">
// right after it — this wires all of them up automatically on load.
const EYE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.6 21.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a21.6 21.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

function initPasswordToggles() {
  qsa(".password-toggle").forEach((btn) => {
    if (btn.dataset.wired) return;
    btn.dataset.wired = "true";
    btn.innerHTML = EYE_ICON;
    btn.setAttribute("aria-label", "Show password");
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      btn.innerHTML = showing ? EYE_ICON : EYE_OFF_ICON;
      btn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    });
  });
}
document.addEventListener("DOMContentLoaded", initPasswordToggles);
