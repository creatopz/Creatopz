/**
 * Shared header behaviour: mobile drawer open/close, active-link
 * highlighting, and Escape/backdrop-to-close. Include on every page
 * that uses the .site-header / .nav-drawer markup.
 */
function initSiteNav() {
  const burger = document.querySelector("[data-nav-open]");
  const drawer = document.querySelector(".nav-drawer");
  const closeBtn = document.querySelector("[data-nav-close]");
  if (!drawer) return;

  const open = () => {
    drawer.classList.add("is-open");
    document.body.classList.add("drawer-open");
    burger?.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    drawer.classList.remove("is-open");
    document.body.classList.remove("drawer-open");
    burger?.setAttribute("aria-expanded", "false");
  };

  burger?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // Mark the current page's nav link active.
  const here = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .nav-drawer-links a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href === here) a.classList.add("active");
  });
}

/**
 * Generic accessible modal open/close helper.
 * Usage: <div class="modal-backdrop" id="fooModal" data-modal>…</div>
 * openModal('fooModal') / closeModal('fooModal')
 */
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("is-open");
  document.body.classList.add("drawer-open");
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("is-open");
  document.body.classList.remove("drawer-open");
}
document.addEventListener("click", (e) => {
  const backdrop = e.target.closest(".modal-backdrop");
  if (backdrop && e.target === backdrop) closeModal(backdrop.id);
  const closer = e.target.closest("[data-modal-close]");
  if (closer) closeModal(closer.closest(".modal-backdrop")?.id);
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  document.querySelectorAll(".modal-backdrop.is-open").forEach((m) => closeModal(m.id));
});

/**
 * Floating bottom nav bar (mobile only) for the public/marketing pages --
 * a small app-style pill of icon links plus a separate WhatsApp button,
 * built once here rather than pasted into every page's HTML. Skipped on
 * any page using the dashboard shell (.dash-shell) since those already
 * have their own topbar/sidebar nav, and on any page without a
 * .site-header (auth.html, the static legal pages) where it has nothing
 * useful to sit alongside.
 */
function initBottomNav() {
  if (document.querySelector(".bottom-nav")) return;
  if (!document.querySelector(".site-header") || document.querySelector(".dash-shell")) return;

  const here = window.location.pathname.split("/").pop() || "index.html";
  const activeClass = (file) => (here === file ? " is-active" : "");

  const nav = document.createElement("nav");
  nav.className = "bottom-nav";
  nav.setAttribute("aria-label", "Quick navigation");
  nav.innerHTML = `
    <a href="index.html" class="bottom-nav-brand${activeClass("index.html")}" aria-label="Home">
      <img src="assets/logo.png" alt="">
    </a>
    <div class="bottom-nav-pill">
      <a href="campaigns.html" class="${activeClass("campaigns.html").trim()}" aria-label="Campaigns" title="Campaigns">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(-20 12 12)"><path d="M4 10v4h2l7 4V6l-7 4H4z"/><path d="M15.5 10a2.6 2.6 0 0 1 0 4"/><path d="M18.3 8a5.6 5.6 0 0 1 0 8"/></g></svg>
      </a>
      <a href="auth.html" class="bottom-nav-account" aria-label="Account" title="Account">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c1.6-3.6 4.5-5.5 7.5-5.5s5.9 1.9 7.5 5.5"/></svg>
      </a>
      <a href="directory.html" class="${activeClass("directory.html").trim()}" aria-label="Creators" title="Creators">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c1-3.2 3.2-5 5.5-5s4.5 1.8 5.5 5"/><circle cx="17" cy="9" r="2.3"/><path d="M15.5 13.3c2 .3 3.6 1.8 4.3 4.2"/></svg>
      </a>
    </div>
    <a href="https://wa.me/918005673683?text=Hi%20Creatopz%2C%20I%20have%20a%20question" target="_blank" rel="noopener" class="bottom-nav-chat" aria-label="Chat with us on WhatsApp" title="Chat with us">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.36 7.55L4 20l1.1-4.5A8.5 8.5 0 1 1 21 11.5z"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="14.5" x2="13" y2="14.5"/></svg>
    </a>
  `;
  document.body.appendChild(nav);
  document.body.classList.add("has-bottom-nav");

  // The account icon needs to know whether anyone's logged in before it
  // can point anywhere useful -- starts pointed at auth.html (safe
  // default) and gets corrected once the session check resolves.
  if (typeof getCurrentProfile === "function") {
    getCurrentProfile().then((profile) => {
      const link = nav.querySelector(".bottom-nav-account");
      if (!link || !profile) return;
      const dashboardHref =
        profile.role === "admin" ? "admin-console.html" : profile.role === "brand" ? "brand-profile.html" : "profile.html";
      link.href = dashboardHref;
      if (here === dashboardHref) link.classList.add("is-active");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSiteNav();
  initBottomNav();
});
