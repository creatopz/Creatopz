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
    "position:fixed;top:0;left:0;height:3px;width:0%;background:var(--red,#FF3300);" +
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

document.addEventListener("DOMContentLoaded", () => {
  initScrollReveal();
  initEnterStagger();
  initScrollProgress();
});
