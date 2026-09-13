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
  const colors = {
    info: "#17140f",
    success: "#3E7C6B",
    error: "#B8493D",
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
    return "You've already done that.";
  }
  // Never show a raw database/Postgres error to a user.
  if (error.code || msg.includes("violates") || msg.includes("constraint")) {
    return "Something went wrong saving that. Please refresh and try again.";
  }
  return error.message || "Something went wrong. Please try again.";
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
