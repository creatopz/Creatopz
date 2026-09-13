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

document.addEventListener("DOMContentLoaded", initSiteNav);
