/**
 * Public creator directory logic.
 * Used by creators.html. Requires supabase-client.js and utils.js.
 */

const PAGE_SIZE = 12;
let currentPage = 0;
let currentFilters = { category: "", location: "", sort: "newest", search: "" };
let reachedEnd = false;

const ICONS = {
  instagram: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A8172" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>`,
  trending: (color) =>
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  pin: (color) =>
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E1A14" stroke-width="1.75"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

const ACCENTS = ["#B8493D", "#3E7C6B", "#7A5C9E", "#C08A2E", "#2E6F9E"];
function accentFor(id) {
  return ACCENTS[Number(id) % ACCENTS.length] || ACCENTS[0];
}

async function fetchCreators({ reset = false } = {}) {
  const grid = document.getElementById("cardGrid");
  const emptyState = document.getElementById("emptyState");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (reset) {
    currentPage = 0;
    reachedEnd = false;
    grid.innerHTML = `<p style="color:var(--muted);grid-column:1/-1;">Loading creators...</p>`;
  }

  let query = supabaseClient
    .from("creators_public")
    .select("*")
    .range(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE - 1);

  if (currentFilters.category) query = query.eq("category", currentFilters.category);
  if (currentFilters.location) query = query.contains("locations", [currentFilters.location]);
  if (currentFilters.search) {
    query = query.or(
      `name.ilike.%${currentFilters.search}%,username.ilike.%${currentFilters.search}%,category.ilike.%${currentFilters.search}%`
    );
  }
  switch (currentFilters.sort) {
    case "followers":
      query = query.order("followers", { ascending: false });
      break;
    case "engagement":
      query = query.order("engagement_rate", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    grid.innerHTML = `<p style="color:#B8493D;grid-column:1/-1;">Couldn't load creators. Please try again.</p>`;
    console.error(error);
    return;
  }

  if (reset) grid.innerHTML = "";
  if (data.length === 0 && currentPage === 0) {
    emptyState.style.display = "block";
    grid.style.display = "none";
    loadMoreBtn.style.display = "none";
    return;
  }
  emptyState.style.display = "none";
  grid.style.display = "grid";

  data.forEach((c) => grid.insertAdjacentHTML("beforeend", renderCard(c)));
  attachCardHandlers();
  if (typeof staggerInGrid === "function") staggerInGrid("#cardGrid", ".card");

  reachedEnd = data.length < PAGE_SIZE;
  loadMoreBtn.style.display = reachedEnd ? "none" : "inline-flex";
}

function renderCard(c) {
  const accent = accentFor(c.id ? c.id.toString().charCodeAt(0) : 0);
  return `
    <button class="card" style="--accent:${accent}" data-id="${c.id}" aria-label="Open ${escapeHtml(c.name)} details">
      <div class="card-bar" style="background:${accent}"></div>
      <div class="card-body">
        <div class="card-top">
          <div class="card-avatar" style="border-color:${accent}55">
            <img src="${c.profile_image || "https://placehold.co/128x128?text=%20"}" alt="${escapeHtml(c.name)}" loading="lazy">
          </div>
          <div>
            <p class="eyebrow" style="color:${accent}">${escapeHtml(c.category || "Creator")}</p>
            <h3 class="card-name serif">${escapeHtml(c.name)}${c.is_verified ? " ✓" : ""}</h3>
          </div>
        </div>
        <div class="stat-row">
          <div>
            <p class="stat-num serif">${formatNumber(c.followers)}</p>
            <p class="stat-label">Followers</p>
          </div>
          <div>
            <p class="stat-num serif" style="color:${accent}">${c.engagement_rate ? c.engagement_rate + "%" : "—"}</p>
            <p class="stat-label">Eng. Rate</p>
          </div>
        </div>
      </div>
    </button>
  `;
}

function attachCardHandlers() {
  qsa(".card", document.getElementById("cardGrid")).forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", async () => {
      const { data, error } = await supabaseClient
        .from("creators_public")
        .select("*")
        .eq("id", btn.dataset.id)
        .single();
      if (!error && data) openModal(data);
    });
  });
}

function openModal(c) {
  const accent = accentFor(c.id ? c.id.toString().charCodeAt(0) : 0);
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("modal");
  modal.innerHTML = `
    <div class="modal-bar" style="background:${accent}"></div>
    <button class="modal-close" id="modalClose" aria-label="Close">${ICONS.close}</button>
    <div class="modal-inner">
      <div class="modal-head">
        <div class="modal-avatar" style="border-color:${accent}55">
          <img src="${c.profile_image || "https://placehold.co/160x160?text=%20"}" alt="${escapeHtml(c.name)}">
        </div>
        <div>
          <p class="eyebrow" style="color:${accent}">${escapeHtml(c.category || "Creator")}</p>
          <h2 class="modal-name serif">${escapeHtml(c.name)}${c.is_verified ? " ✓" : ""}</h2>
          ${c.bio ? `<p style="color:var(--muted);font-size:14px;margin-top:8px;max-width:44ch;">${escapeHtml(c.bio)}</p>` : ""}
        </div>
      </div>

      <div class="modal-stats">
        <div class="modal-stat">
          ${ICONS.instagram}
          <div>
            <p class="stat-num serif">${formatNumber(c.followers)}</p>
            <p class="stat-label">Followers</p>
          </div>
        </div>
        <div class="modal-stat">
          ${ICONS.trending(accent)}
          <div>
            <p class="stat-num serif" style="color:${accent}">${c.engagement_rate ? c.engagement_rate + "%" : "—"}</p>
            <p class="stat-label">Engagement Rate</p>
          </div>
        </div>
      </div>

      <div>
        <p class="section-title">Brand Partnerships</p>
        <div class="brands">
          ${
            (c.brand_partnerships || []).length
              ? c.brand_partnerships.map((b) => `<span class="brand-chip">${escapeHtml(b)}</span>`).join("")
              : `<span style="font-size:14px;color:var(--muted);">No partnerships added yet</span>`
          }
        </div>
      </div>

      <div class="two-col">
        <div>
          <p class="section-title">Content &amp; Platforms</p>
          ${
            (c.content_types || []).length
              ? `<div class="brands">${c.content_types.map((t) => `<span class="brand-chip">${escapeHtml(t)}</span>`).join("")}</div>`
              : `<p style="font-size:14px;color:var(--muted);margin:0;">Not added yet</p>`
          }
        </div>
        <div>
          <p class="section-title">Locations</p>
          ${
            (c.locations || []).length
              ? `<ul class="loc-list">${c.locations.map((loc) => `<li>${ICONS.pin(accent)} ${escapeHtml(loc)}</li>`).join("")}</ul>`
              : `<p style="font-size:14px;color:var(--muted);margin:0;">Not added yet</p>`
          }
        </div>
      </div>

      ${
        (c.audience_female_pct || c.audience_male_pct)
          ? `<div style="margin-top:28px;">
              <p class="section-title">Audience Gender Split</p>
              <div style="height:8px;border-radius:999px;overflow:hidden;display:flex;background:var(--line);">
                <div style="width:${c.audience_female_pct || 0}%;background:#DB5A82;"></div>
                <div style="width:${c.audience_male_pct || 0}%;background:${accent};"></div>
              </div>
              <p style="font-size:12.5px;color:var(--muted);margin-top:8px;">${c.audience_female_pct || 0}% Female &middot; ${c.audience_male_pct || 0}% Male</p>
            </div>`
          : ""
      }

      <div style="margin-top:28px;padding:14px 16px;background:var(--cream,#F7F4EE);border-radius:10px;font-size:13.5px;color:var(--muted);">
        Contact details are shared by the Creatopz team once a brand and creator are matched — reach out via <a href="campaigns.html" style="color:inherit;font-weight:600;">an open campaign</a> or your dashboard to get started.
      </div>
    </div>
  `;
  overlay.classList.add("open");
  document.getElementById("modalClose").addEventListener("click", closeModal);
}

function closeModal() {
  document.getElementById("overlay").classList.remove("open");
}

function initCreatorDirectory() {
  fetchCreators({ reset: true });

  document.getElementById("overlay").addEventListener("click", (e) => {
    if (e.target.id === "overlay") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  document.getElementById("categoryFilter")?.addEventListener("change", (e) => {
    currentFilters.category = e.target.value;
    fetchCreators({ reset: true });
  });
  document.getElementById("sortFilter")?.addEventListener("change", (e) => {
    currentFilters.sort = e.target.value;
    fetchCreators({ reset: true });
  });
  let searchTimer;
  document.getElementById("searchInput")?.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentFilters.search = e.target.value.trim();
      fetchCreators({ reset: true });
    }, 300);
  });
  document.getElementById("loadMoreBtn")?.addEventListener("click", () => {
    currentPage += 1;
    fetchCreators();
  });
}
