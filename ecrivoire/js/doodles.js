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
