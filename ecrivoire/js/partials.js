/* ==========================================================================
   ÉCRIVOIRE STUDIOS — shared header / footer / cart-drawer markup
   Injected on every page so navigation stays identical everywhere and the
   current page gets highlighted automatically via body[data-page].
   ========================================================================== */

(function () {
  function logo(size, tag) {
    tag = tag || "span";
    return `<${tag} class="logo logo--${size}">
      <span class="logo__circle">
        <span class="logo__word">Écrivoire</span>
        <span class="logo__word">Studios</span>
      </span>
    </${tag}>`;
  }

  const NAV_ITEMS = [
    { href: "index.html", label: "Home", key: "home" },
    { href: "shop.html", label: "Shop", key: "shop" },
    { href: "journal.html", label: "Journal", key: "journal" },
    { href: "events.html", label: "Events", key: "events" },
    { href: "requests.html", label: "Wishlist", key: "requests" },
    { href: "publish.html", label: "Publish", key: "publish" },
    { href: "about.html", label: "About", key: "about" },
    { href: "contact.html", label: "Contact", key: "contact" }
  ];

  function navLinks(current, cls) {
    return NAV_ITEMS.map((item) => {
      const current_attr = item.key === current ? ' aria-current="page"' : "";
      return `<a href="${item.href}" class="${cls || ""}"${current_attr}>${item.label}</a>`;
    }).join("\n");
  }

  function headerHTML(current) {
    return `
    <div class="wrap nav">
      <a href="index.html" aria-label="Écrivoire Studios — home">${logo("sm")}</a>
      <nav class="nav__links" aria-label="Primary">
        ${navLinks(current)}
      </nav>
      <div class="nav__right">
        <button type="button" class="nav__cart" id="cart-open-btn" aria-haspopup="dialog" aria-controls="cart-drawer">
          Bag <span class="nav__cart-count" id="cart-count">0</span>
        </button>
        <button type="button" class="nav__burger" id="nav-burger" aria-label="Open menu" aria-controls="nav-mobile" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <div class="nav__scrim" id="nav-scrim"></div>
    <nav class="nav__mobile" id="nav-mobile" aria-label="Mobile">
      <button type="button" class="nav__mobile-close" id="nav-mobile-close">Close ✕</button>
      ${navLinks(current)}
    </nav>`;
  }

  function marqueeHTML(items) {
    const list = items && items.length ? items : [
      "🐮 Purple Cow Approved picks every drop", "Free pan-India delivery over ₹999", "A new numbered edition every month",
      "The Purple Cow Club — members save 10–18%", "Publish With Us — we read every submission", "Spin the Shelf for a surprise read"
    ];
    const track = list.map((t) => `<span>${t}</span>`).join("");
    return `<div class="marquee"><div class="marquee__track">${track}${track}</div></div>`;
  }

  function footerHTML() {
    const year = new Date().getFullYear();
    return `
    <div class="wrap">
      <div class="footer__grid">
        <div>
          <a href="index.html" aria-label="Écrivoire Studios — home">${logo("md")}</a>
          <p class="body" style="margin-top:1.4rem;font-size:.9rem;max-width:32ch;">
            A small press: numbered editions of public-domain classics, hand-bound in-house, released in a limited run every month.
          </p>
        </div>
        <div>
          <div class="footer__title">Shop</div>
          <ul class="footer__links">
            <li><a href="shop.html">All editions</a></li>
            <li><a href="shop.html?genre=Fiction">Fiction</a></li>
            <li><a href="shop.html?genre=Poetry">Poetry</a></li>
            <li><a href="shop.html?badge=New Drop">This month's drop</a></li>
            <li><a href="shop.html?badge=Staff Pick">Staff picks</a></li>
          </ul>
        </div>
        <div>
          <div class="footer__title">Studio</div>
          <ul class="footer__links">
            <li><a href="about.html">About us</a></li>
            <li><a href="journal.html">Journal</a></li>
            <li><a href="events.html">Events</a></li>
            <li><a href="requests.html">Wishlist wall</a></li>
            <li><a href="publish.html">Publish with us</a></li>
          </ul>
        </div>
        <div>
          <div class="footer__title">Reach us</div>
          <ul class="footer__links">
            <li>Online only, for now</li>
            <li>Shipping pan-India</li>
            <li>Shopfront: planned, not open yet</li>
            <li><a href="mailto:hello@ecrivoirestudios.example">hello@ecrivoirestudios.example</a></li>
            <li><a href="contact.html">Contact form</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <small>© ${year} Écrivoire Studios. A demo bookstore built for the love of books — no real orders are processed. Prices shown in ₹ (INR).</small>
        <div class="footer__socials">
          <a href="#">Instagram</a>
          <a href="#">Are.na</a>
          <a href="#">Newsletter</a>
          <a href="admin.html" class="footer__admin-link">Studio admin</a>
        </div>
      </div>
    </div>`;
  }

  function cartDrawerHTML() {
    return `
    <div class="cart-scrim" id="cart-scrim"></div>
    <aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <div class="cart-drawer__head">
        <span class="h-md" style="font-size:1.1rem;">Your Bag</span>
        <button type="button" class="cart-drawer__close" id="cart-close-btn" aria-label="Close bag">✕</button>
      </div>
      <div class="cart-drawer__body" id="cart-body">
        <p class="cart-drawer__empty">Your bag is empty. Go find something to read.</p>
      </div>
      <div class="cart-drawer__foot">
        <div class="cart-drawer__row"><span>Subtotal</span><span class="cart-drawer__total" id="cart-subtotal">₹0</span></div>
        <button type="button" class="btn btn-red btn-block" id="cart-checkout-btn">Checkout</button>
        <p class="cart-drawer__note">Demo store — checkout confirms your order but nothing is charged or shipped.</p>
      </div>
    </aside>`;
  }

  function mount(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  window.EcrivoirePartials = {
    logo, headerHTML, footerHTML, cartDrawerHTML, marqueeHTML,
    injectAll(current) {
      mount("site-header", headerHTML(current));
      mount("site-footer", footerHTML());
      mount("cart-root", cartDrawerHTML());
      const mq = document.getElementById("site-marquee");
      if (mq) mq.innerHTML = marqueeHTML(mq.dataset.items ? JSON.parse(mq.dataset.items) : null);
    }
  };
})();
