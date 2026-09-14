/* ==========================================================================
   ÉCRIVOIRE STUDIOS — Inkling & friends
   The mascot family, the "meet the crew" carousel, the scroll rail Inkling
   rides across every page, confetti, and the shared toast() used by admin
   and the wishlist panel. This is the "purple cow" made literal: a small
   illustrated cast that makes the brand unmistakably ours.
   ========================================================================== */

(function () {
  "use strict";
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const INK = "#141311";
  const CREAM = "#F3ECDC";

  /* ---------------------------------------------------------------- */
  /* Mascot artwork — same rough-ink filter as js/doodles.js           */
  /* ---------------------------------------------------------------- */
  const ART = {
    inkling: `
      <path d="M50,13 C25,13 12,32 15,52 C9,58 9,71 18,77 C15,85 22,93 30,89 C36,95 64,95 70,89 C78,93 85,85 82,77 C91,71 91,58 85,52 C88,32 75,13 50,13 Z" fill="${CREAM}" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
      <path d="M19,42 C6,36 4,21 15,17 C22,23 25,33 27,41 Z" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
      <path d="M81,42 C94,36 96,21 85,17 C78,23 75,33 73,41 Z" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
      <path d="M38,15 C35,7 40,2 45,7" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M62,15 C65,7 60,2 55,7" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M66,28 Q76,26 73,38 Q63,40 66,28 Z" fill="${INK}" opacity=".16"/>
      <rect x="29" y="45" width="16" height="14" rx="2.5" fill="none" stroke="${INK}" stroke-width="3.2"/>
      <rect x="55" y="45" width="16" height="14" rx="2.5" fill="none" stroke="${INK}" stroke-width="3.2"/>
      <path d="M45,51 L55,51" stroke="${INK}" stroke-width="3.2"/>
      <path d="M29,50 L18,48" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M71,50 L82,48" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="37" cy="52" r="2.6" fill="${INK}"/><circle cx="63" cy="52" r="2.6" fill="${INK}"/>
      <circle cx="44" cy="73" r="2.4" fill="${INK}"/><circle cx="56" cy="73" r="2.4" fill="${INK}"/>
      <path d="M39,79 Q50,86 61,79" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`,
    spine: `
      <rect x="17" y="14" width="66" height="74" rx="5" fill="${CREAM}" stroke="${INK}" stroke-width="3.4"/>
      <path d="M30,14 L30,88" stroke="${INK}" stroke-width="2.4" opacity=".3"/>
      <path d="M20,25 L27,25 M20,33 L27,33 M20,41 L27,41" stroke="${INK}" stroke-width="2" opacity=".3" stroke-linecap="round"/>
      <rect x="52" y="4" width="9" height="22" fill="currentColor" stroke="${INK}" stroke-width="2.6"/>
      <circle cx="47" cy="46" r="4.2" fill="${INK}"/><circle cx="64" cy="46" r="4.2" fill="${INK}"/>
      <path d="M42,62 Q56,72 70,62" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`,
    nib: `
      <path d="M50,10 C70,20 78,50 62,78 C57,87 47,90 42,84 C55,76 60,54 50,38 C40,54 45,76 58,84 C53,90 43,87 38,78 C22,50 30,20 50,10 Z" fill="${CREAM}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="M50,38 L46,92 L54,92 Z" fill="${INK}"/>
      <circle cx="42" cy="34" r="4" fill="${INK}"/><circle cx="58" cy="34" r="4" fill="${INK}"/>
      <path d="M43,47 Q50,53 57,47" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="72" cy="24" r="3" fill="currentColor" stroke="${INK}" stroke-width="2"/>`,
    brew: `
      <path d="M20,38 L26,78 Q50,90 74,78 L80,38 Z" fill="${CREAM}" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
      <path d="M79,44 Q99,43 95,62 Q92,76 76,70" fill="none" stroke="${INK}" stroke-width="3.4"/>
      <path d="M34,26 Q28,16 37,9" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M50,26 Q44,14 53,7" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M66,26 Q60,16 69,9" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M38,52 C38,47 43,47 44,51 C45,47 50,47 50,52 C50,56 44,60 44,60 C44,60 38,56 38,52 Z" fill="${INK}"/>
      <path d="M52,52 C52,47 57,47 58,51 C59,47 64,47 64,52 C64,56 58,60 58,60 C58,60 52,56 52,52 Z" fill="${INK}"/>
      <path d="M42,68 Q50,74 58,68" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
    glow: `
      <path d="M50,10 C68,10 78,26 70,42 C66,50 62,52 62,60 L38,60 C38,52 34,50 30,42 C22,26 32,10 50,10 Z" fill="${CREAM}" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
      <rect x="38" y="60" width="24" height="10" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
      <rect x="33" y="70" width="34" height="12" rx="3" fill="currentColor" stroke="${INK}" stroke-width="3.2"/>
      <path d="M14,30 L24,34 M18,14 L26,22 M86,30 L76,34 M82,14 L74,22" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="42" cy="34" r="3.6" fill="${INK}"/><circle cx="58" cy="34" r="3.6" fill="${INK}"/>
      <path d="M43,44 Q50,49 57,44" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>`,
    fold: `
      <path d="M28,8 L72,8 L72,70 C72,70 64,60 60,70 C56,80 50,58 44,70 C40,80 36,60 28,70 Z" fill="${CREAM}" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
      <circle cx="42" cy="34" r="4.2" fill="${INK}"/><circle cx="58" cy="34" r="4.2" fill="${INK}"/>
      <path d="M40,48 Q50,56 60,48" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`
  };

  function ensureDefs() {
    // js/doodles.js owns the shared <filter id="rough-a/b"> defs; this call
    // is idempotent and safe even before any [data-doodle] element exists.
    window.EcrivoireDoodles?.paint(document);
  }

  function mascotSVG(id, filter) {
    const body = ART[id];
    if (!body) return "";
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><g filter="url(#${filter || "rough-a"})">${body}</g></svg>`;
  }

  /* ---------------------------------------------------------------- */
  /* "Meet the crew" carousel                                          */
  /* ---------------------------------------------------------------- */
  function renderMascotBand(containerId) {
    const root = document.getElementById(containerId);
    if (!root || !window.ECRIVOIRE_DATA) return;
    ensureDefs();
    const mascots = window.ECRIVOIRE_DATA.MASCOTS;
    root.innerHTML = `
      <button type="button" class="mascot-arrow mascot-arrow--prev" aria-label="Scroll left">‹</button>
      <div class="mascot-track" id="${containerId}-track">
        ${mascots.map((m) => `
          <div class="mascot-card pop-in">
            <div class="mascot-card__ring pal-${m.pal}">
              <span class="mascot-card__icon">${mascotSVG(m.id)}</span>
            </div>
            <div class="mascot-card__name">${m.name}</div>
            <div class="mascot-card__role">${m.role}</div>
          </div>`).join("")}
      </div>
      <button type="button" class="mascot-arrow mascot-arrow--next" aria-label="Scroll right">›</button>`;

    const track = document.getElementById(containerId + "-track");
    root.querySelector(".mascot-arrow--prev")?.addEventListener("click", () => track.scrollBy({ left: -240, behavior: "smooth" }));
    root.querySelector(".mascot-arrow--next")?.addEventListener("click", () => track.scrollBy({ left: 240, behavior: "smooth" }));
    window.EcrivoireApp?.initPopIn?.();
  }

  /* ---------------------------------------------------------------- */
  /* Scroll rail — Inkling rides the top of the page as you read       */
  /* ---------------------------------------------------------------- */
  function initScrollRail() {
    if (document.getElementById("scroll-rail")) return;
    ensureDefs();
    const rail = document.createElement("div");
    rail.className = "scroll-rail";
    rail.id = "scroll-rail";
    rail.innerHTML = `<div class="scroll-rail__fill" id="scroll-rail-fill"></div>`;
    document.body.appendChild(rail);
    const mascot = document.createElement("div");
    mascot.className = "scroll-rail__mascot";
    mascot.id = "scroll-rail-mascot";
    mascot.innerHTML = mascotSVG("inkling", "rough-b");
    mascot.style.color = "var(--ink)";
    document.body.appendChild(mascot);

    const fill = document.getElementById("scroll-rail-fill");
    let ticking = false;
    function update() {
      const h = document.documentElement;
      const scrollTop = h.scrollTop || document.body.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (scrollTop / max) * 100)) : 0;
      fill.style.width = pct + "%";
      mascot.style.left = pct + "%";
      ticking = false;
    }
    update();
    window.addEventListener("scroll", () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------------------------------------------------------------- */
  /* Floating Inkling button — a small, always-there delight loop       */
  /* ---------------------------------------------------------------- */
  const QUIPS = [
    "🐮 Purple Cow says: you have excellent taste.",
    "Psst — the Collector tier gets you 10% off, always.",
    "Inkling recommends reading one page further than planned.",
    "You found me! Have a virtual biscuit. 🍪",
    "Fun fact: Inkling has read every book in the shop. Twice.",
    "A wild purple cow appeared! It used Recommend. It's super effective.",
    "Keep clicking. I have nowhere to be.",
    "Someone in the back room just rebound a very old paperback."
  ];

  function initFloatingMascot() {
    if (document.getElementById("floating-mascot")) return;
    ensureDefs();
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "floating-mascot";
    btn.setAttribute("aria-label", "Say hi to Inkling");
    btn.style.cssText = `
      position:fixed;left:1.1rem;bottom:1.1rem;width:58px;height:58px;border-radius:50%;
      background:var(--grey-100,#EAEAE6);border:3px solid var(--ink,#131313);
      box-shadow:4px 4px 0 0 var(--ink,#141311);z-index:900;padding:8px;
      transition:transform .18s cubic-bezier(.34,1.56,.64,1);cursor:pointer;`;
    btn.innerHTML = mascotSVG("inkling", "rough-a");
    document.body.appendChild(btn);

    let clicks = 0, lastClick = 0;
    btn.addEventListener("click", (e) => {
      const now = Date.now();
      clicks = now - lastClick < 1600 ? clicks + 1 : 1;
      lastClick = now;
      btn.style.transform = "scale(1.18) rotate(-8deg)";
      setTimeout(() => (btn.style.transform = ""), 220);
      const rect = btn.getBoundingClientRect();
      if (clicks >= 5) {
        confettiBurst(rect.left + rect.width / 2, rect.top);
        toast("🎉 You found Inkling's secret stash of confetti!");
        clicks = 0;
      } else {
        toast(QUIPS[Math.floor(Math.random() * QUIPS.length)]);
      }
    });
  }

  /* ---------------------------------------------------------------- */
  /* Confetti burst                                                    */
  /* ---------------------------------------------------------------- */
  const CONFETTI_COLORS = ["#131313", "#464646", "#6E6E6E", "#A6A6A3", "#D8D8D4", "#FAFAF8"];
  function confettiBurst(x, y, count) {
    count = count || 26;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "confetti-piece";
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 90;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 40;
      const rot = (Math.random() * 720 - 360) + "deg";
      el.style.setProperty("--dx", dx + "px");
      el.style.setProperty("--dy", dy + "px");
      el.style.setProperty("--rot", rot);
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      el.style.animation = `confettiFall ${0.7 + Math.random() * 0.5}s ease-out forwards`;
      document.body.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
      setTimeout(() => el.remove(), 1500);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Toast                                                             */
  /* ---------------------------------------------------------------- */
  let toastTimer = null;
  function toast(message, ms) {
    let el = document.getElementById("ecrivoire-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "ecrivoire-toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), ms || 3000);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initScrollRail();
    initFloatingMascot();
  });

  window.EcrivoireMascot = { renderMascotBand, mascotSVG, confettiBurst, toast, initScrollRail, initFloatingMascot };
})();
