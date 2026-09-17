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

// ---------- Mask-line reveal ----------
// Author lines as <span class="mask-line"><span class="inner">...</span></span>
// inside a container carrying data-mask-group; this arms .is-visible
// on that container once it's scrolled into view (theme.css staggers
// each line's transition-delay by nth-child).
function initMaskReveal() {
  const groups = document.querySelectorAll("[data-mask-group]");
  if (!groups.length) return;
  if (PREFERS_REDUCED_MOTION || typeof IntersectionObserver === "undefined") {
    groups.forEach((g) => g.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
    });
  }, { threshold: 0.3, rootMargin: "0px 0px -60px 0px" });
  groups.forEach((g) => io.observe(g));
  setTimeout(() => groups.forEach((g) => g.classList.add("is-visible")), 4000); // safety net
}

// ---------- Pinned horizontal scroll gallery ----------
// Converts vertical scroll into horizontal track motion while pinned,
// with no scroll library -- a tall wrapper (#id .pin-gallery-wrap) is
// sized by JS to give just enough scroll room to pan the whole track,
// and a scroll listener sets translateX from scroll progress. Falls
// back to a plain native horizontally-scrollable strip below 769px
// and under prefers-reduced-motion -- scroll-jacking a phone is bad
// UX regardless of how it looks on desktop.
function initPinGallery(wrapSelector) {
  const wrap = document.querySelector(wrapSelector);
  if (!wrap) return;
  const sticky = wrap.querySelector(".pin-gallery-sticky");
  const track = wrap.querySelector(".pin-gallery-track");
  if (!sticky || !track) return;

  const useNativeScroll = PREFERS_REDUCED_MOTION || !window.matchMedia("(min-width:769px)").matches;
  if (useNativeScroll) {
    wrap.style.height = "auto";
    sticky.style.position = "static";
    sticky.style.height = "auto";
    track.classList.add("is-native-scroll");
    return;
  }

  function setHeight() {
    const extra = Math.max(track.scrollWidth - window.innerWidth, 0);
    wrap.style.height = window.innerHeight + extra + "px";
  }
  function update() {
    const rect = wrap.getBoundingClientRect();
    const scrollable = wrap.offsetHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 1) : 0;
    const maxX = Math.max(track.scrollWidth - window.innerWidth, 0);
    track.style.transform = `translateX(${-progress * maxX}px)`;
  }
  setHeight();
  update();
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener("resize", () => { setHeight(); update(); });
}

document.addEventListener("DOMContentLoaded", () => {
  initAutoReveal(); // must run before initScrollReveal reads [data-reveal]
  initScrollReveal();
  initEnterStagger();
  initScrollProgress();
  initMagneticButtons();
  initLinkSweep();
  initCountUp();
  initSpotlightCards();
  initWordReveal();
  initMaskReveal();
});
