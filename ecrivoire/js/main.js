/* ==========================================================================
   ÉCRIVOIRE STUDIOS — application logic
   Cart, filtering, rendering and small interactions for a fully working
   front-end demo. No backend: state lives in localStorage.
   ========================================================================== */

(function () {
  "use strict";
  const DATA = window.ECRIVOIRE_DATA;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const fmt = (n) => "$" + n.toFixed(0);
  const CART_KEY = "ecrivoire_cart_v1";

  /* ---------------------------------------------------------------- */
  /* Cart                                                              */
  /* ---------------------------------------------------------------- */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    renderCartDrawer();
  }
  function addToCart(id, qty) {
    qty = qty || 1;
    const cart = getCart();
    const line = cart.find((l) => l.id === id);
    if (line) line.qty += qty; else cart.push({ id, qty });
    saveCart(cart);
    openCart();
  }
  function setQty(id, qty) {
    let cart = getCart();
    if (qty <= 0) cart = cart.filter((l) => l.id !== id);
    else { const line = cart.find((l) => l.id === id); if (line) line.qty = qty; }
    saveCart(cart);
  }
  function removeFromCart(id) { saveCart(getCart().filter((l) => l.id !== id)); }
  function cartCount() { return getCart().reduce((n, l) => n + l.qty, 0); }
  function cartLines() {
    return getCart().map((l) => ({ ...l, book: DATA.BOOKS.find((b) => b.id === l.id) })).filter((l) => l.book);
  }
  function cartTotal() { return cartLines().reduce((sum, l) => sum + l.book.price * l.qty, 0); }

  function renderCartDrawer() {
    const countEls = $$("#cart-count");
    countEls.forEach((el) => (el.textContent = cartCount()));
    const body = $("#cart-body");
    const subtotal = $("#cart-subtotal");
    if (subtotal) subtotal.textContent = fmt(cartTotal());
    if (!body) return;
    const lines = cartLines();
    if (!lines.length) {
      body.innerHTML = `<p class="cart-drawer__empty">Your bag is empty. Go find something to read.</p>`;
      return;
    }
    body.innerHTML = lines.map((l) => `
      <div class="cart-item" data-id="${l.id}">
        <div class="cart-item__cover pal-${l.book.pal}">${l.book.mark}</div>
        <div>
          <div class="cart-item__title">${l.book.title}</div>
          <div class="cart-item__author">${l.book.author}</div>
          <div class="cart-item__qty">
            <button type="button" data-qty-down>–</button>
            <span>${l.qty}</span>
            <button type="button" data-qty-up>+</button>
          </div>
          <a href="#" class="cart-item__remove" data-remove>Remove</a>
        </div>
        <div class="cart-item__price">${fmt(l.book.price * l.qty)}</div>
      </div>`).join("");

    $$("[data-qty-up]", body).forEach((btn) => btn.addEventListener("click", () => {
      const id = btn.closest(".cart-item").dataset.id;
      const line = getCart().find((l) => l.id === id);
      setQty(id, (line ? line.qty : 0) + 1);
    }));
    $$("[data-qty-down]", body).forEach((btn) => btn.addEventListener("click", () => {
      const id = btn.closest(".cart-item").dataset.id;
      const line = getCart().find((l) => l.id === id);
      setQty(id, (line ? line.qty : 1) - 1);
    }));
    $$("[data-remove]", body).forEach((btn) => btn.addEventListener("click", (e) => {
      e.preventDefault();
      removeFromCart(btn.closest(".cart-item").dataset.id);
    }));
  }

  function openCart() {
    $("#cart-drawer")?.classList.add("is-open");
    $("#cart-scrim")?.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    $("#cart-drawer")?.classList.remove("is-open");
    $("#cart-scrim")?.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function initCartUI() {
    renderCartDrawer();
    $("#cart-open-btn")?.addEventListener("click", openCart);
    $("#cart-close-btn")?.addEventListener("click", closeCart);
    $("#cart-scrim")?.addEventListener("click", closeCart);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });
    $("#cart-checkout-btn")?.addEventListener("click", () => {
      const foot = $(".cart-drawer__foot");
      if (!foot || !cartLines().length) return;
      foot.innerHTML = `
        <p style="font-weight:700;display:flex;align-items:center;gap:.5em;">
          <span data-doodle="check" style="width:20px;height:20px;color:var(--red);flex-shrink:0;"></span>
          Order confirmed — thank you!
        </p>
        <p class="cart-drawer__note">This is a demo store, so nothing was actually charged or shipped. Your bag has been cleared.</p>
        <button type="button" class="btn btn-outline btn-block" id="cart-continue-btn" style="margin-top:1rem;">Continue browsing</button>`;
      saveCart([]);
      window.EcrivoireDoodles?.paint(foot);
      $("#cart-continue-btn")?.addEventListener("click", closeCart);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Nav (mobile)                                                      */
  /* ---------------------------------------------------------------- */
  function initNav() {
    const burger = $("#nav-burger"), mobile = $("#nav-mobile"), scrim = $("#nav-scrim"), close = $("#nav-mobile-close");
    function open() { mobile?.classList.add("is-open"); scrim?.classList.add("is-open"); burger?.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; }
    function shut() { mobile?.classList.remove("is-open"); scrim?.classList.remove("is-open"); burger?.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; }
    burger?.addEventListener("click", open);
    close?.addEventListener("click", shut);
    scrim?.addEventListener("click", shut);
    $$("#nav-mobile a").forEach((a) => a.addEventListener("click", shut));
  }

  /* ---------------------------------------------------------------- */
  /* Reveal-on-scroll                                                  */
  /* ---------------------------------------------------------------- */
  function initReveal() {
    const items = $$(".reveal:not(.is-visible)");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -5% 0px" });
    items.forEach((el) => io.observe(el));
    // Safety net: never leave content permanently invisible (slow observers,
    // restored-from-cache pages, unusual viewports).
    window.setTimeout(() => items.forEach((el) => el.classList.add("is-visible")), 1800);
  }

  /* ---------------------------------------------------------------- */
  /* Book rendering helpers                                            */
  /* ---------------------------------------------------------------- */
  function coverHTML(book, size) {
    return `
    <div class="cover pal-${book.pal}">
      <div class="cover__mark">${book.mark}</div>
      <div class="cover__foot">
        <div class="cover__rule"></div>
        <div class="cover__title">${book.title}</div>
        <div class="cover__author">${book.author}</div>
      </div>
    </div>`;
  }

  function badgeHTML(badge) {
    if (!badge) return "";
    return `<span class="badge badge--red">${badge}</span>`;
  }

  function bookCardHTML(book) {
    return `
    <article class="book-card reveal">
      <div class="book-card__cover-wrap">
        <a href="book.html?id=${book.id}" aria-label="${book.title}">
          ${badgeHTML(book.badge)}
          ${coverHTML(book)}
        </a>
        <button type="button" class="book-card__add" data-add-to-cart="${book.id}" aria-label="Add ${book.title} to bag" title="Add to bag">+</button>
      </div>
      <a href="book.html?id=${book.id}" class="book-card__info">
        <span>
          <div class="book-card__title">${book.title}</div>
          <div class="book-card__author">${book.author}</div>
        </span>
        <span class="book-card__price">${fmt(book.price)}</span>
      </a>
    </article>`;
  }

  function wireAddButtons(root) {
    $$("[data-add-to-cart]", root || document).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        addToCart(btn.dataset.addToCart, 1);
      });
    });
  }

  function renderGrid(container, books) {
    if (!container) return;
    container.innerHTML = books.map(bookCardHTML).join("") || `<p class="body" style="grid-column:1/-1;">No books match those filters yet — try clearing them.</p>`;
    wireAddButtons(container);
    window.EcrivoireDoodles?.paint(container);
    initReveal();
  }

  /* ---------------------------------------------------------------- */
  /* Forms                                                             */
  /* ---------------------------------------------------------------- */
  function initForms() {
    $$("form[data-form]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const success = $(".form-success", form.parentElement) || $(".form-success", form);
        if (success) success.classList.add("is-visible");
        form.reset();
        const btn = $("button[type=submit]", form);
        if (btn) {
          const original = btn.textContent;
          btn.textContent = "Sent ✓";
          btn.disabled = true;
          setTimeout(() => { btn.textContent = original; btn.disabled = false; if (success) success.classList.remove("is-visible"); }, 4000);
        }
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Shop page                                                         */
  /* ---------------------------------------------------------------- */
  function initShopPage() {
    const grid = $("#shop-grid");
    if (!grid) return;
    const params = new URLSearchParams(location.search);
    const state = {
      genre: params.get("genre") || "All",
      badge: params.get("badge") || "",
      q: params.get("q") || "",
      sort: params.get("sort") || "featured"
    };

    const chipRow = $("#genre-chips");
    if (chipRow) {
      const genres = ["All", ...DATA.GENRES];
      chipRow.innerHTML = genres.map((g) => `<button type="button" class="chip${g === state.genre ? " is-active" : ""}" data-genre="${g}">${g}</button>`).join("");
    }
    const searchInput = $("#shop-search");
    if (searchInput) searchInput.value = state.q;
    const sortSelect = $("#shop-sort");
    if (sortSelect) sortSelect.value = state.sort;
    const countEl = $("#shop-result-count");

    function apply() {
      let list = DATA.BOOKS.slice();
      if (state.genre && state.genre !== "All") list = list.filter((b) => b.genre === state.genre);
      if (state.badge) list = list.filter((b) => (b.badge || "").toLowerCase() === state.badge.toLowerCase());
      if (state.q) {
        const q = state.q.toLowerCase();
        list = list.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
      }
      if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
      else if (state.sort === "price-desc") list.sort((a, b) => b.price - a.price);
      else if (state.sort === "title") list.sort((a, b) => a.title.localeCompare(b.title));
      else if (state.sort === "newest") list.sort((a, b) => b.year - a.year);

      renderGrid(grid, list);
      if (countEl) countEl.textContent = `${list.length} book${list.length === 1 ? "" : "s"}`;

      const url = new URL(location.href);
      state.genre !== "All" ? url.searchParams.set("genre", state.genre) : url.searchParams.delete("genre");
      state.badge ? url.searchParams.set("badge", state.badge) : url.searchParams.delete("badge");
      state.q ? url.searchParams.set("q", state.q) : url.searchParams.delete("q");
      state.sort !== "featured" ? url.searchParams.set("sort", state.sort) : url.searchParams.delete("sort");
      history.replaceState({}, "", url);
    }

    chipRow?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-genre]");
      if (!btn) return;
      state.genre = btn.dataset.genre;
      state.badge = "";
      $$(".chip", chipRow).forEach((c) => c.classList.toggle("is-active", c === btn));
      apply();
    });
    searchInput?.addEventListener("input", () => { state.q = searchInput.value; apply(); });
    sortSelect?.addEventListener("change", () => { state.sort = sortSelect.value; apply(); });

    if (state.badge) { const clear = $("#clear-badge"); clear && (clear.hidden = false); }
    $("#clear-badge")?.addEventListener("click", () => { state.badge = ""; state.genre = "All"; $("#clear-badge").hidden = true; apply(); });

    apply();
  }

  /* ---------------------------------------------------------------- */
  /* Book detail page                                                  */
  /* ---------------------------------------------------------------- */
  function initBookPage() {
    const root = $("#book-detail-root");
    if (!root) return;
    const id = new URLSearchParams(location.search).get("id");
    const book = DATA.BOOKS.find((b) => b.id === id);
    const notFound = $("#book-not-found");

    if (!book) {
      root.hidden = true;
      if (notFound) notFound.hidden = false;
      return;
    }
    document.title = `${book.title} — Écrivoire Studios`;
    $("#book-crumb-title") && ($("#book-crumb-title").textContent = book.title);
    $("#book-cover-slot").innerHTML = `${badgeHTML(book.badge)}${coverHTML(book)}`;
    $("#book-title").textContent = book.title;
    $("#book-author").textContent = "by " + book.author;
    $("#book-price").textContent = fmt(book.price);
    $("#book-blurb").textContent = book.blurb;
    $("#book-genre-tag").textContent = book.genre;
    const specs = { Publisher: book.publisher, Published: book.year, Pages: book.pages, ISBN: book.isbn, Genre: book.genre };
    $("#book-specs").innerHTML = Object.entries(specs).map(([k, v]) => `<div class="event-row" style="grid-template-columns:1fr 1fr;padding-block:.9rem;"><span class="mono" style="color:var(--muted);">${k}</span><span>${v}</span></div>`).join("");
    $("#book-rating").innerHTML = Array.from({ length: 5 }).map((_, i) => `<span data-doodle="${i < book.rating ? "sparkle" : "circleScribble"}"></span>`).join("");

    let qty = 1;
    const qtyEl = $("#book-qty");
    $("#qty-up")?.addEventListener("click", () => { qty++; qtyEl.textContent = qty; });
    $("#qty-down")?.addEventListener("click", () => { qty = Math.max(1, qty - 1); qtyEl.textContent = qty; });
    $("#book-add-btn")?.addEventListener("click", () => addToCart(book.id, qty));

    const related = DATA.BOOKS.filter((b) => b.genre === book.genre && b.id !== book.id).slice(0, 4);
    const relatedWrap = $("#book-related-grid");
    if (relatedWrap) {
      if (related.length) renderGrid(relatedWrap, related);
      else $("#book-related-section")?.setAttribute("hidden", "");
    }
    window.EcrivoireDoodles?.paint(root);
    initReveal();
  }

  /* ---------------------------------------------------------------- */
  /* Journal                                                           */
  /* ---------------------------------------------------------------- */
  function journalCardHTML(post) {
    return `
    <a class="journal-card reveal" href="journal-post.html?slug=${post.slug}">
      <div class="cover pal-${post.pal}" style="aspect-ratio:4/3;">
        <div class="cover__mark">${post.mark}</div>
        <div></div>
      </div>
      <div class="journal-card__tag">${post.tag}</div>
      <div class="journal-card__title">${post.title}</div>
      <p class="journal-card__excerpt">${post.excerpt}</p>
      <div class="journal-card__meta">${formatDate(post.date)} · ${post.author}</div>
    </a>`;
  }

  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  function initJournalPage() {
    const grid = $("#journal-grid");
    if (!grid) return;
    const [feature, ...rest] = DATA.JOURNAL;
    const featureWrap = $("#journal-feature");
    if (featureWrap && feature) {
      featureWrap.innerHTML = `
        <div class="journal-feature__art pal-${feature.pal}">
          <div class="cover__mark" style="font-size:5rem;">${feature.mark}</div>
        </div>
        <div>
          <div class="journal-card__tag">${feature.tag}</div>
          <h2 class="h-lg serif" style="text-transform:none;margin-top:.6rem;">${feature.title}</h2>
          <p class="body" style="margin-top:1rem;">${feature.excerpt}</p>
          <div class="journal-card__meta" style="margin-top:1.2rem;">${formatDate(feature.date)} · ${feature.author}</div>
          <a href="journal-post.html?slug=${feature.slug}" class="btn btn-outline" style="margin-top:1.6rem;">Read the piece</a>
        </div>`;
    }
    grid.innerHTML = rest.map(journalCardHTML).join("");
    window.EcrivoireDoodles?.paint(document);
    initReveal();
  }

  function initJournalPostPage() {
    const root = $("#post-root");
    if (!root) return;
    const slug = new URLSearchParams(location.search).get("slug");
    const post = DATA.JOURNAL.find((p) => p.slug === slug);
    const notFound = $("#post-not-found");
    if (!post) { root.hidden = true; if (notFound) notFound.hidden = false; return; }
    document.title = `${post.title} — Journal — Écrivoire Studios`;
    $("#post-tag").textContent = post.tag;
    $("#post-title").textContent = post.title;
    $("#post-meta").textContent = `${formatDate(post.date)} · By ${post.author}`;
    $("#post-body").textContent = post.body;
    $("#post-art").className = `cover pal-${post.pal} journal-feature__art`;
    $("#post-art").innerHTML = `<div class="cover__mark" style="font-size:5rem;">${post.mark}</div><div></div>`;

    const others = DATA.JOURNAL.filter((p) => p.slug !== post.slug).slice(0, 3);
    const moreGrid = $("#post-more-grid");
    if (moreGrid) moreGrid.innerHTML = others.map(journalCardHTML).join("");
    window.EcrivoireDoodles?.paint(document);
    initReveal();
  }

  /* ---------------------------------------------------------------- */
  /* Events                                                            */
  /* ---------------------------------------------------------------- */
  function initEventsPage() {
    const wrap = $("#events-list");
    if (!wrap) return;
    const reserved = JSON.parse(localStorage.getItem("ecrivoire_rsvps") || "[]");
    wrap.innerHTML = DATA.EVENTS.map((ev) => {
      const d = new Date(ev.date + "T00:00:00");
      const isReserved = reserved.includes(ev.id);
      return `
      <div class="event-row">
        <div class="event-row__date">${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}<span>${d.getFullYear()}</span></div>
        <div>
          <div class="event-row__title">${ev.title}</div>
          <div class="event-row__place">${ev.place} · ${ev.desc}</div>
        </div>
        <div class="event-row__time">${ev.time}</div>
        <button type="button" class="btn btn-sm ${isReserved ? "btn-outline" : ""}" data-rsvp="${ev.id}" ${isReserved ? "disabled" : ""}>
          ${isReserved ? "✓ Reserved" : "Reserve a seat"}
        </button>
      </div>`;
    }).join("");

    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-rsvp]");
      if (!btn) return;
      const list = JSON.parse(localStorage.getItem("ecrivoire_rsvps") || "[]");
      if (!list.includes(btn.dataset.rsvp)) list.push(btn.dataset.rsvp);
      localStorage.setItem("ecrivoire_rsvps", JSON.stringify(list));
      btn.textContent = "✓ Reserved";
      btn.disabled = true;
      btn.classList.add("btn-outline");
    });
  }

  /* ---------------------------------------------------------------- */
  /* Home page                                                         */
  /* ---------------------------------------------------------------- */
  function initHomePage() {
    const newGrid = $("#home-new-grid");
    if (!newGrid) return;
    const featured = DATA.BOOKS.filter((b) => b.badge).slice(0, 8);
    renderGrid(newGrid, featured.length ? featured : DATA.BOOKS.slice(0, 8));

    const tileWrap = $("#home-genre-tiles");
    if (tileWrap) {
      tileWrap.innerHTML = DATA.GENRES.map((g, i) => {
        const count = DATA.BOOKS.filter((b) => b.genre === g).length;
        return `
        <a class="tile reveal" href="shop.html?genre=${encodeURIComponent(g)}">
          <span class="tile__num">${String(i + 1).padStart(2, "0")}</span>
          <span>
            <div class="tile__name serif">${g}</div>
            <div class="tile__count">${count} title${count === 1 ? "" : "s"}</div>
          </span>
        </a>`;
      }).join("");
    }

    const testiWrap = $("#home-testimonials");
    if (testiWrap) {
      testiWrap.innerHTML = DATA.TESTIMONIALS.map((t) => `
        <div class="testimonial reveal">
          <p>“${t.quote}”</p>
          <div class="testimonial__who">${t.who}</div>
        </div>`).join("");
    }

    const eventsWrap = $("#home-events-preview");
    if (eventsWrap) {
      eventsWrap.innerHTML = DATA.EVENTS.slice(0, 3).map((ev) => {
        const d = new Date(ev.date + "T00:00:00");
        return `
        <div class="event-row">
          <div class="event-row__date">${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}<span>${d.getFullYear()}</span></div>
          <div><div class="event-row__title">${ev.title}</div><div class="event-row__place">${ev.place}</div></div>
          <div class="event-row__time">${ev.time}</div>
          <a href="events.html" class="btn btn-sm btn-outline">Details</a>
        </div>`;
      }).join("");
    }

    const journalWrap = $("#home-journal-preview");
    if (journalWrap) journalWrap.innerHTML = DATA.JOURNAL.slice(0, 3).map(journalCardHTML).join("");

    window.EcrivoireDoodles?.paint(document);
    initReveal();
  }

  /* ---------------------------------------------------------------- */
  /* Boot                                                              */
  /* ---------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page || "";
    window.EcrivoirePartials?.injectAll(page);
    window.EcrivoireDoodles?.paint(document);
    initNav();
    initCartUI();
    initForms();
    initHomePage();
    initShopPage();
    initBookPage();
    initJournalPage();
    initJournalPostPage();
    initEventsPage();
    initReveal();
    window.EcrivoireDoodles?.paint(document);
  });

  window.EcrivoireApp = { addToCart, fmt, bookCardHTML, renderGrid };
})();
