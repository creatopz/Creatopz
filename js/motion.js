/**
 * Creatopz motion system.
 * Scroll-reveal, cursor-glow, and scroll-progress — shared across pages.
 * Respects prefers-reduced-motion throughout.
 */

const PREFERS_REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Scroll reveal ----------
// Add data-reveal to any element. Optional data-reveal-group="x" makes
// siblings with the same group auto-stagger in DOM order.
function initScrollReveal() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;

  if (PREFERS_REDUCED_MOTION || typeof IntersectionObserver === "undefined") {
    return; // elements are visible by default via CSS — nothing to do
  }

  const groupCounters = {};
  els.forEach((el) => {
    const group = el.dataset.revealGroup || el.dataset.reveal;
    groupCounters[group] = (groupCounters[group] || 0);
    const index = groupCounters[group]++;
    el.style.transitionDelay = Math.min(index * 90, 450) + "ms";
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  // Only NOW arm the hidden state (elements were visible via CSS until this
  // point) — so if anything above throws, content simply stays visible.
  document.documentElement.classList.add("reveal-armed");
  els.forEach((el) => observer.observe(el));

  // Extra safety net: if anything is still hidden after a few seconds
  // (observer never fired for some reason), show it anyway.
  setTimeout(() => {
    els.forEach((el) => el.classList.add("is-visible"));
  }, 4000);
}

// ---------- Hero / above-fold entrance ----------
// Elements with data-enter fade in via a pure CSS keyframe animation
// (see [data-enter] in theme.css) — no JS involved, so hero content can
// never end up stuck invisible. This just staggers them in DOM order.
function initEnterStagger() {
  document.querySelectorAll("[data-enter]").forEach((el, i) => {
    el.style.animationDelay = i * 100 + "ms";
  });
}

// ---------- Cursor glow ----------
// Call with a container selector; sets --mx/--my CSS vars on mousemove,
// used by a radial-gradient background defined in the page's own CSS.
function initCursorGlow(selector) {
  if (PREFERS_REDUCED_MOTION) return;
  const el = document.querySelector(selector);
  if (!el) return;
  let ticking = false;
  let lastX = 0, lastY = 0;
  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        el.style.setProperty("--mx", lastX + "px");
        el.style.setProperty("--my", lastY + "px");
        ticking = false;
      });
    }
  });
}

// ---------- Scroll progress bar ----------
function initScrollProgress() {
  const bar = document.createElement("div");
  bar.id = "scrollProgressBar";
  bar.style.cssText =
    "position:fixed;top:0;left:0;height:3px;width:0%;background:var(--accent,#e7473c);" +
    "z-index:9999;transition:width .1s linear;";
  document.body.appendChild(bar);
  if (PREFERS_REDUCED_MOTION) return;
  window.addEventListener(
    "scroll",
    () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = scrolled + "%";
    },
    { passive: true }
  );
}

// ---------- Auto-reveal ----------
// Tags common content blocks with data-reveal automatically, so a page
// gets the scroll-reveal treatment just by loading this file -- no
// hand-added markup needed on every section of every page. Skipped
// inside the dashboard/admin shell (a working tool, not a marketing
// page) and inside anything that opts out with data-no-reveal.
function initAutoReveal() {
  if (document.querySelector(".dash-shell")) return;
  const els = document.querySelectorAll(
    ".grid > *, .card:not([data-reveal]), .stat-card:not([data-reveal]), .panel:not([data-reveal]), .creator-card:not([data-reveal]), .campaign-card:not([data-reveal]), .section-head:not([data-reveal])"
  );
  els.forEach((el) => {
    if (el.closest("[data-reveal]") || el.closest("[data-enter]")) return;
    if (el.hasAttribute("data-reveal") || el.hasAttribute("data-no-reveal")) return;
    el.setAttribute("data-reveal", "");
  });
}

// ---------- Magnetic buttons ----------
// A small cursor-pull on hover -- skipped for full-width buttons (a
// pull looks wrong on something that already spans the container) and
// respects prefers-reduced-motion like everything else here.
function initMagneticButtons() {
  if (PREFERS_REDUCED_MOTION) return;
  const strength = 8;
  document.querySelectorAll(".btn:not(.btn-block)").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * strength * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * strength * 2;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });
}

// ---------- Animated underline on nav/footer links ----------
// Adds .link-sweep to the common link lists site-wide (see [theme.css])
// rather than requiring the class hand-added in every page's markup.
function initLinkSweep() {
  document.querySelectorAll(".nav-links a, .site-footer a, .hero-window-nav a").forEach((a) => a.classList.add("link-sweep"));
}

// ---------- Count-up numbers ----------
// Animates an element's number from 0 -> target once it's on screen.
// Two ways in: mark static HTML with data-count-to="1234" and it's
// picked up automatically on load, or call animateCountUp(el, value)
// directly once you have a value back from an async fetch (the usual
// case for this site's live Supabase counts).
function animateCountUp(el, target, { duration = 900, formatter } = {}) {
  if (!el) return;
  const fmt = formatter || ((n) => Math.round(n).toLocaleString("en-IN"));
  const targetNum = Number(target) || 0;
  if (PREFERS_REDUCED_MOTION) { el.textContent = fmt(targetNum); return; }
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(targetNum * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function initCountUp() {
  const els = document.querySelectorAll("[data-count-to]");
  if (!els.length) return;
  const run = (el) => animateCountUp(el, parseFloat(el.dataset.countTo));
  if (typeof IntersectionObserver === "undefined") { els.forEach(run); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  els.forEach((el) => io.observe(el));
}

// ---------- Stagger-in a freshly-rendered grid (e.g. after a fetch) ----------
// Call right after you set grid.innerHTML with fresh cards.
function staggerInGrid(gridSelector, itemSelector) {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;
  const items = grid.querySelectorAll(itemSelector);
  if (PREFERS_REDUCED_MOTION) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  items.forEach((item, i) => {
    item.classList.add("stagger-item");
    item.style.transitionDelay = Math.min(i * 45, 400) + "ms";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => item.classList.add("is-visible"));
    });
  });
  // Safety net: guarantee visibility even if the rAF chain above never fires.
  setTimeout(() => {
    items.forEach((item) => item.classList.add("is-visible"));
  }, 1200);
}

// ---------- Custom cursor ----------
// A small dot + trailing ring on desktop pointers, skipped entirely on
// touch/coarse pointers and under prefers-reduced-motion. Off inside
// the dashboard/admin shell -- a work tool, not the marketing site.
function initCustomCursor() {
  if (PREFERS_REDUCED_MOTION) return;
  if (!window.matchMedia("(min-width:901px) and (hover:hover) and (pointer:fine)").matches) return;
  if (document.querySelector(".dash-shell")) return;

  const dot = document.createElement("div");
  dot.id = "ctzCursorDot";
  const ring = document.createElement("div");
  ring.id = "ctzCursorRing";
  document.body.append(dot, ring);
  document.body.classList.add("custom-cursor");

  let x = 0, y = 0, rx = 0, ry = 0;
  window.addEventListener("mousemove", (e) => {
    x = e.clientX; y = e.clientY;
    dot.style.left = x + "px"; dot.style.top = y + "px";
  });
  (function loop() {
    rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
    ring.style.left = rx + "px"; ring.style.top = ry + "px";
    requestAnimationFrame(loop);
  })();

  const hideOn = "input, textarea, select, [contenteditable]";
  const growOn = "a, button, .btn, .card-hover, .creator-card, .campaign-card, .spotlight-card";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hideOn)) { dot.classList.add("is-hidden"); ring.classList.add("is-hidden"); return; }
    dot.classList.remove("is-hidden"); ring.classList.remove("is-hidden");
    const grown = e.target.closest(growOn);
    ring.classList.toggle("is-hover", !!grown);
    ring.classList.toggle("is-dark", !!(grown && grown.closest(".hero-window, .cta-panel, .section-dark, [style*='background:var(--ink)'], [style*='background: var(--ink)']")));
  });
}

// ---------- Spotlight cards ----------
// Cursor-follow glow inside existing card components -- adds
// .spotlight-card and tracks --mx/--my per card, no markup needed.
function initSpotlightCards() {
  if (PREFERS_REDUCED_MOTION) return;
  if (document.querySelector(".dash-shell")) return; // keep the work-tool chrome calm, like every other effect here
  document.querySelectorAll(".card-hover, .creator-card, .campaign-card").forEach((card) => {
    card.classList.add("spotlight-card");
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
}

// ---------- Ambient particles ----------
// Populates a .particles-host panel with a handful of faintly drifting
// motes. Call once per host after it's in the DOM.
function initParticles(selectorOrEl, count = 16) {
  if (PREFERS_REDUCED_MOTION) return;
  const host = typeof selectorOrEl === "string" ? document.querySelector(selectorOrEl) : selectorOrEl;
  if (!host) return;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "particle";
    p.style.left = Math.random() * 100 + "%";
    p.style.setProperty("--dx", (Math.random() * 40 - 20) + "px");
    p.style.animationDuration = 6 + Math.random() * 6 + "s";
    p.style.animationDelay = Math.random() * 8 + "s";
    host.appendChild(p);
  }
}

// ---------- Word-by-word reveal ----------
// Wraps each word of a heading (marked data-word-reveal) in a span so
// theme.css can stagger them in on load. Preserves inner tags like <em>.
function initWordReveal() {
  document.querySelectorAll("[data-word-reveal]").forEach((el) => {
    const chunks = el.innerHTML.split(/(<[^>]+>.*?<\/[^>]+>|\s+)/g).filter(Boolean);
    let html = "", delay = 0;
    chunks.forEach((chunk) => {
      if (/^\s+$/.test(chunk)) { html += chunk; return; }
      const isTag = /^</.test(chunk);
      html += isTag
        ? chunk.replace(/^<([a-z]+)([^>]*)>(.*)<\/\1>$/i, (m, tag, attrs, inner) => `<span class="word" style="animation-delay:${delay}ms;"><${tag}${attrs}>${inner}</${tag}></span>`)
        : `<span class="word" style="animation-delay:${delay}ms;">${chunk}</span>`;
      delay += 90;
    });
    el.innerHTML = html;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initAutoReveal(); // must run before initScrollReveal reads [data-reveal]
  initScrollReveal();
  initEnterStagger();
  initScrollProgress();
  initMagneticButtons();
  initLinkSweep();
  initCountUp();
  initCustomCursor();
  initSpotlightCards();
  initWordReveal();
});
