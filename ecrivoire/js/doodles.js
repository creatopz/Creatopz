/* ==========================================================================
   ÉCRIVOIRE STUDIOS — hand-drawn doodle system
   Clean SVG paths run through an SVG displacement filter so every line
   comes out with a slightly wobbly, hand-inked quality — consistent,
   but never mechanically perfect.
   ========================================================================== */

(function () {
  const NS = "http://www.w3.org/2000/svg";

  // Injected once: the roughening filters every doodle references.
  const FILTER_DEFS = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs>
        <filter id="rough-a" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/>
        </filter>
        <filter id="rough-b" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="9" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4"/>
        </filter>
      </defs>
    </svg>`;

  // Each doodle: a viewBox + inner markup, stroke-based, filled "none" unless noted.
  const DOODLES = {
    underline: {
      vb: "0 0 200 24", filter: "rough-a",
      body: `<path d="M3,14 C40,4 75,20 100,12 C130,3 165,18 197,9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`
    },
    "underline-2": {
      vb: "0 0 200 30", filter: "rough-b",
      body: `<path d="M4,10 C50,2 90,16 150,7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
             <path d="M10,22 C55,16 95,26 150,18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`
    },
    arrow: {
      vb: "0 0 100 100", filter: "rough-a",
      body: `<path d="M8,18 C42,12 78,40 62,72" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
             <path d="M62,72 L44,60" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
             <path d="M62,72 L52,86" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`
    },
    "arrow-right": {
      vb: "0 0 120 60", filter: "rough-a",
      body: `<path d="M4,30 C40,26 78,34 108,29" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
             <path d="M108,29 L90,16" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
             <path d="M108,29 L92,44" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`
    },
    swirl: {
      vb: "0 0 100 100", filter: "rough-a",
      body: `<path d="M12,82 C6,46 34,18 62,30 C82,39 78,62 58,60 C44,58 44,42 58,40" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
             <path d="M58,40 L50,32 M58,40 L67,36" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`
    },
    sparkle: {
      vb: "0 0 100 100", filter: "rough-a",
      body: `<path d="M50,4 L59,42 L96,50 L59,58 L50,96 L41,58 L4,50 L41,42 Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`
    },
    star5: {
      vb: "0 0 100 100", filter: "rough-a",
      body: `<path d="M50,4 L61,37 L96,37 L67,58 L78,92 L50,71 L22,92 L33,58 L4,37 L39,37 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`
    },
    circleScribble: {
      vb: "0 0 100 100", filter: "rough-b",
      body: `<path d="M50,14 C74,12 90,30 88,52 C86,76 64,92 40,86 C18,80 8,56 18,36 C24,24 36,15 52,17" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`
    },
    book: {
      vb: "0 0 100 100", filter: "rough-a",
      body: `<rect x="18" y="62" width="64" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="3.5"/>
             <rect x="23" y="49" width="54" height="11" rx="1.5" transform="rotate(-2 50 54)" fill="none" stroke="currentColor" stroke-width="3.5"/>
             <rect x="20" y="36" width="58" height="11" rx="1.5" transform="rotate(2 50 41)" fill="none" stroke="currentColor" stroke-width="3.5"/>
             <path d="M38,36 Q50,26 62,36" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>`
    },
    openBook: {
      vb: "0 0 100 70", filter: "rough-a",
      body: `<path d="M50,12 C40,6 20,4 8,8 L8,56 C20,52 40,54 50,60 C60,54 80,52 92,56 L92,8 C80,4 60,6 50,12 Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>
             <path d="M50,12 L50,60" fill="none" stroke="currentColor" stroke-width="3.5"/>
             <path d="M16,20 L40,17 M16,28 L40,25 M16,36 L38,33" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
             <path d="M84,20 L60,17 M84,28 L60,25 M84,36 L62,33" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`
    },
    coffee: {
      vb: "0 0 100 100", filter: "rough-a",
      body: `<path d="M22,42 L27,78 Q50,88 73,78 L78,42 Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>
             <path d="M77,48 Q96,47 93,63 Q90,76 75,71" fill="none" stroke="currentColor" stroke-width="3.5"/>
             <path d="M36,32 Q31,22 39,16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
             <path d="M50,32 Q45,20 53,14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
             <path d="M64,32 Q59,22 67,16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`
    },
    heart: {
      vb: "0 0 100 100", filter: "rough-a",
      body: `<path d="M50,88 C8,60 4,28 26,16 C40,8 50,20 50,30 C50,20 60,8 74,16 C96,28 92,60 50,88 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`
    },
    quoteMarks: {
      vb: "0 0 100 60", filter: "rough-b",
      body: `<path d="M32,8 C16,8 10,22 14,35 C17,45 29,47 33,38 C36,52 24,66 10,70" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
             <path d="M78,8 C62,8 56,22 60,35 C63,45 75,47 79,38 C82,52 70,66 56,70" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`
    },
    bookmark: {
      vb: "0 0 60 100", filter: "rough-a",
      body: `<path d="M12,6 L48,6 L48,92 L30,72 L12,92 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`
    },
    pencil: {
      vb: "0 0 100 100", filter: "rough-a",
      body: `<path d="M14,86 L64,32 L80,48 L30,100 Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>
             <path d="M64,32 L76,20 L92,36 L80,48" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>
             <path d="M14,86 L8,100 L22,94" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>`
    },
    check: {
      vb: "0 0 60 60", filter: "rough-b",
      body: `<path d="M8,30 L24,46 L52,12" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`
    },
    plane: {
      vb: "0 0 100 60", filter: "rough-b",
      body: `<path d="M6,30 C40,18 70,14 94,18 C74,24 50,28 30,34 C42,36 54,40 62,46 C48,44 34,42 20,44 C24,50 26,54 26,56 C18,50 10,40 6,30 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`
    },
    star4Small: {
      vb: "0 0 40 40", filter: "rough-b",
      body: `<path d="M20,2 L24,17 L38,20 L24,23 L20,38 L16,23 L2,20 L16,17 Z" fill="currentColor"/>`
    },
    /* Reading-cat doodles — cute, animated, meant to catch the eye.
       Sub-parts carry their own class (cat-paw, cat-yarn-ball, …) so
       css/style.css can animate just that limb, not the whole drawing. */
    catYarn: {
      vb: "0 0 120 110", filter: "rough-a",
      body: `<path d="M35,95 C25,95 20,80 24,68 C18,60 20,45 32,42 C30,30 40,20 52,22 C56,14 66,14 70,22 C82,20 90,30 86,42 C96,46 96,62 88,68 C90,80 82,95 68,95 Z" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>
             <path d="M40,26 L34,10 L50,20 Z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/>
             <path d="M78,20 L88,8 L82,26 Z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/>
             <circle cx="50" cy="36" r="2.6" fill="currentColor"/><circle cx="68" cy="36" r="2.6" fill="currentColor"/>
             <path d="M56,44 Q59,48 62,44" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
             <path d="M30,38 L14,34 M30,42 L14,42 M88,38 L104,34 M88,42 L104,42" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
             <path d="M86,80 Q104,76 100,56" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
             <g class="cat-paw" style="transform-origin:28px 70px;"><path d="M28,70 C18,74 10,84 14,92 C22,96 30,90 30,80 Z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/></g>
             <g class="cat-yarn-ball" style="transform-origin:14px 98px;"><circle cx="14" cy="98" r="12" fill="none" stroke="currentColor" stroke-width="2.8"/><path d="M4,98 Q14,90 24,98 M4,98 Q14,106 24,98 M8,90 Q14,98 8,106 M20,90 Q14,98 20,106" fill="none" stroke="currentColor" stroke-width="1.6"/></g>`
    },
    catStretch: {
      vb: "0 0 120 90", filter: "rough-a",
      body: `<g class="cat-stretch-scene" style="transform-origin:60px 74px;">
             <path d="M10,70 C8,60 14,55 22,56 C20,44 30,34 42,36 C44,26 56,22 64,28 C70,20 84,22 88,32 C100,32 108,44 102,56 C108,62 106,72 96,74 L18,74 Z" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>
             <path d="M14,74 L6,84 M24,74 L18,86" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
             <path d="M92,74 L94,86 M100,72 L104,86" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
             <circle cx="20" cy="52" r="14" fill="none" stroke="currentColor" stroke-width="3"/>
             <path d="M10,44 L6,32 L18,40 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
             <path d="M26,42 L34,30 L28,44 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
             <circle cx="16" cy="52" r="2" fill="currentColor"/><circle cx="24" cy="52" r="2" fill="currentColor"/>
             <path d="M100,60 Q116,52 110,36" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></g>`
    },
    catPounce: {
      vb: "0 0 120 90", filter: "rough-a",
      body: `<g class="cat-pounce-scene">
             <path d="M14,60 C8,48 16,36 30,38 C34,26 50,22 60,30 C72,22 88,28 88,42 C100,42 106,54 98,62 C100,72 90,78 80,74 C70,80 54,78 48,70 C34,74 20,70 14,60 Z" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>
             <path d="M26,36 L20,24 L34,32 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
             <path d="M42,28 L48,16 L52,30 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
             <circle cx="34" cy="42" r="2.2" fill="currentColor"/><circle cx="46" cy="40" r="2.2" fill="currentColor"/>
             <path d="M18,58 L6,66 M30,64 L22,76" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
             <path d="M84,66 L92,76 M94,60 L104,66" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
             <path d="M92,50 Q112,46 114,60" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
             <rect x="60" y="78" width="24" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.4"/></g>`
    },
    catSleep: {
      vb: "0 -6 120 96", filter: "rough-b",
      body: `<rect x="30" y="70" width="60" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.6"/>
             <rect x="35" y="61" width="50" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.6"/>
             <path d="M60,60 C38,60 30,44 42,32 C36,20 48,10 60,16 C68,8 82,12 82,24 C94,24 98,38 88,46 C92,56 80,64 68,60 Z" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>
             <path d="M44,24 L38,12 L52,20 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
             <path d="M70,14 L78,4 L74,18 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
             <path d="M52,30 Q56,34 60,30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
             <path d="M48,26 Q51,28 54,26 M62,26 Q65,28 68,26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
             <path d="M84,46 Q100,50 92,62 Q84,70 74,62" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
             <g class="cat-zzz"><text x="86" y="20" font-family="'Space Grotesk',sans-serif" font-weight="700" font-size="10" fill="currentColor">z</text><text x="96" y="10" font-family="'Space Grotesk',sans-serif" font-weight="700" font-size="14" fill="currentColor">z</text><text x="107" y="-2" font-family="'Space Grotesk',sans-serif" font-weight="700" font-size="18" fill="currentColor">z</text></g>`
    }
  };

  function svgFor(name, extraClass) {
    const d = DOODLES[name];
    if (!d) return "";
    return `<svg viewBox="${d.vb}" class="${extraClass || ""}" aria-hidden="true"><g filter="url(#${d.filter})">${d.body}</g></svg>`;
  }

  function paint(root) {
    const scope = root || document;
    if (!document.getElementById("ecrivoire-doodle-defs")) {
      const wrap = document.createElement("div");
      wrap.id = "ecrivoire-doodle-defs";
      wrap.innerHTML = FILTER_DEFS;
      document.body.prepend(wrap);
    }
    scope.querySelectorAll("[data-doodle]").forEach((el) => {
      if (el.dataset.painted) return;
      const name = el.dataset.doodle;
      el.innerHTML = svgFor(name);
      el.dataset.painted = "1";
    });
  }

  window.EcrivoireDoodles = { paint, svgFor, names: Object.keys(DOODLES) };
})();
