/**
 * Public campaign marketplace logic. Used by campaigns.html.
 * Requires supabase-client.js, utils.js, auth.js.
 */

function formatBudget() {
  // Exact budget is negotiated through Creatopz admin, not shown publicly.
  return "Budget: discussed via Creatopz";
}

function formatDeadline(d) {
  if (!d) return "Rolling";
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

// Whole days between now and the deadline, floored at 0 so a deadline that
// has technically passed (still shown while status is "open") doesn't
// render as negative.
function daysLeft(d) {
  if (!d) return null;
  const ms = new Date(d).setHours(23, 59, 59, 999) - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

const FALLBACK_CAMPAIGN_NICHES = ["All", "Beauty", "Fashion & Style", "Skincare", "Food", "Fitness"];
let ALL_CAMPAIGNS = [];
let campaignState = { query: "", niche: "All", sort: "newest" };

async function loadCampaigns() {
  const stateHost = document.getElementById("campaignState");
  stateHost.innerHTML = `<div class="grid grid-3">${Array.from({ length: 6 }).map(() => `<div class="skeleton" style="height:260px;"></div>`).join("")}</div>`;

  const { data, error } = await supabaseClient
    .from("campaigns_public")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    stateHost.innerHTML = `<div class="state-block"><div class="state-icon">!</div><h3>Something went wrong</h3><p>Couldn't load campaigns right now. Please try refreshing.</p></div>`;
    document.getElementById("campaignGrid").innerHTML = "";
    console.error(error);
    return;
  }

  const brandIds = [...new Set((data || []).map((c) => c.brand_id).filter(Boolean))];
  let brandsById = {};
  if (brandIds.length) {
    const { data: brandRows } = await supabaseClient
      .from("brands_public")
      .select("id, company_name, logo_url")
      .in("id", brandIds);
    brandsById = Object.fromEntries((brandRows || []).map((b) => [b.id, b]));
  }

  const profile = await getCurrentProfile().catch(() => null);
  let appliedIds = new Set();
  if (profile && profile.role === "creator") {
    const { data: myCreator } = await supabaseClient
      .from("creators")
      .select("id")
      .eq("user_id", profile.id)
      .single();
    if (myCreator) {
      const { data: apps } = await supabaseClient
        .from("campaign_applications")
        .select("campaign_id")
        .eq("creator_id", myCreator.id);
      appliedIds = new Set((apps || []).map((a) => a.campaign_id));
    }
  }

  ALL_CAMPAIGNS = (data || []).map((c) => ({
    ...c,
    brand: brandsById[c.brand_id] || null,
    applied: appliedIds.has(c.id),
  }));
  CAMPAIGN_PROFILE = profile;

  stateHost.innerHTML = "";
  renderCampaignChips();
  renderCampaigns();
}

let CAMPAIGN_PROFILE = null;

function renderCampaignChips() {
  const names = Array.from(new Set(["All", ...ALL_CAMPAIGNS.map((c) => c.niche || "General")]));
  const list = names.length > 1 ? names : FALLBACK_CAMPAIGN_NICHES;
  const host = document.getElementById("campaignChips");
  host.innerHTML = list.map((label) =>
    `<button class="chip ${label === campaignState.niche ? "is-selected" : ""}" data-niche="${escapeHtml(label)}">${escapeHtml(label)}</button>`
  ).join("");
  host.querySelectorAll("[data-niche]").forEach((btn) => {
    btn.addEventListener("click", () => { campaignState.niche = btn.dataset.niche; renderCampaigns(); renderCampaignChips(); });
  });
}

function renderCampaigns() {
  const q = campaignState.query.trim().toLowerCase();
  let list = ALL_CAMPAIGNS.filter((c) => {
    const inNiche = campaignState.niche === "All" || (c.niche || "General") === campaignState.niche;
    const haystack = [c.title, c.brand?.company_name, c.niche].filter(Boolean).join(" ").toLowerCase();
    const inQuery = !q || haystack.includes(q);
    return inNiche && inQuery;
  });
  list = list.slice().sort((a, b) => {
    if (campaignState.sort === "closing") {
      const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return da - db;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  document.getElementById("campaignResultCount").textContent = list.length;
  document.getElementById("campaignActiveLabel").textContent =
    (campaignState.niche === "All" ? "All niches" : campaignState.niche) + (q ? ` · "${campaignState.query.trim()}"` : "");

  const grid = document.getElementById("campaignGrid");
  if (!list.length) {
    grid.innerHTML = "";
    document.getElementById("campaignState").innerHTML = `
      <div class="state-block">
        <div class="state-icon">◎</div>
        <h3>No campaigns match that</h3>
        <p style="margin-bottom:20px;">Try a different niche — or clear the filters.</p>
        <button class="btn btn-outline" id="clearCampaignFiltersBtn">Clear filters</button>
      </div>`;
    document.getElementById("clearCampaignFiltersBtn")?.addEventListener("click", () => {
      campaignState = { query: "", niche: "All", sort: campaignState.sort };
      document.getElementById("campaignSearch").value = "";
      renderCampaignChips();
      renderCampaigns();
    });
    return;
  }
  document.getElementById("campaignState").innerHTML = "";
  grid.innerHTML = list.map((c) => renderCampaignCard(c, c.applied, CAMPAIGN_PROFILE)).join("");
  attachCampaignHandlers();
  if (typeof staggerInGrid === "function") staggerInGrid("#campaignGrid", ".campaign-card");
}

function renderCampaignCard(c, alreadyApplied, profile) {
  const canApply = profile && profile.role === "creator";
  const left = daysLeft(c.deadline);
  return `
    <div class="campaign-card card-hover" data-id="${c.id}">
      <div class="cp-brand">
        <div class="avatar-fallback" style="width:44px;height:44px;border-radius:var(--r-md);overflow:hidden;font-size:16px;flex-shrink:0;">
          ${c.brand?.logo_url ? `<img src="${escapeHtml(c.brand.logo_url)}" alt="${escapeHtml(c.brand.company_name || "")}" style="width:100%;height:100%;object-fit:cover;">` : escapeHtml((c.brand?.company_name || "?")[0])}
        </div>
        <div style="min-width:0;">
          <p class="caption" style="text-transform:uppercase;letter-spacing:.04em;">${escapeHtml(c.brand?.company_name || "Brand")}</p>
          <h3 class="cp-title">${escapeHtml(c.title)}</h3>
        </div>
      </div>
      <p class="cp-desc">${escapeHtml(c.brief || c.description || "")}</p>
      <div class="cp-tags">
        <span class="badge">${escapeHtml(c.niche || "General")}</span>
        ${(c.platforms || []).length ? `<span class="badge">${(c.platforms || []).map(escapeHtml).join(", ")}</span>` : ""}
        ${c.location ? `<span class="badge">${escapeHtml(c.location)}</span>` : ""}
      </div>
      ${c.requirements ? `<p class="body-sm" style="margin-top:2px;"><b style="color:var(--ink);">You need:</b> ${escapeHtml(c.requirements)}</p>` : ""}
      <div class="cp-foot">
        <div>
          <div class="cp-budget">${formatBudget()}</div>
          <div class="caption">${left === null ? "Rolling deadline" : left === 0 ? "Closes today" : `${left} day${left === 1 ? "" : "s"} left`} · ${formatDeadline(c.deadline)}</div>
        </div>
        ${
          canApply
            ? alreadyApplied
              ? `<button class="btn btn-outline btn-sm applied-btn" disabled>Applied</button>`
              : `<button class="btn btn-accent btn-sm apply-btn" data-id="${c.id}">Apply</button>`
            : `<a href="auth.html?mode=signup&role=creator" class="btn btn-outline btn-sm">Sign up to apply</a>`
        }
      </div>
    </div>
  `;
}

function attachCampaignHandlers() {
  qsa(".apply-btn").forEach((btn) => {
    btn.addEventListener("click", () => openApplyDialog(btn.dataset.id, btn));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("campaignSearch")?.addEventListener("input", (e) => { campaignState.query = e.target.value; renderCampaigns(); });
  document.getElementById("campaignSort")?.addEventListener("change", (e) => { campaignState.sort = e.target.value; renderCampaigns(); });
});

let pendingApplyCampaignId = null;
let pendingApplyTriggerBtn = null;

function openApplyDialog(campaignId, triggerBtn) {
  pendingApplyCampaignId = campaignId;
  pendingApplyTriggerBtn = triggerBtn;
  const textarea = document.getElementById("applyMessage");
  textarea.value = "";
  document.getElementById("applyCharCount").textContent = "0";
  openModal("applyOverlay");
  textarea.focus();
}

function closeApplyDialog() {
  closeModal("applyOverlay");
  pendingApplyCampaignId = null;
  pendingApplyTriggerBtn = null;
}

async function submitApplication() {
  const message = document.getElementById("applyMessage").value.trim();
  const campaignId = pendingApplyCampaignId;
  const triggerBtn = pendingApplyTriggerBtn;
  const confirmBtn = document.getElementById("applyConfirmBtn");
  if (!campaignId || !triggerBtn) return;

  setButtonLoading(confirmBtn, true, "Sending...");
  try {
    const profile = await getCurrentProfile();
    if (!profile) throw new Error("Please log in as a creator to apply.");
    const { data: myCreator, error: creatorErr } = await supabaseClient
      .from("creators")
      .select("id")
      .eq("user_id", profile.id)
      .single();
    if (creatorErr || !myCreator) throw new Error("Complete your creator profile before applying.");

    const { error } = await supabaseClient.from("campaign_applications").insert({
      campaign_id: campaignId,
      creator_id: myCreator.id,
      message: message || "",
      status: "pending",
    });
    if (error) {
      if (error.code === "23505") {
        showToast("You've already applied to this campaign.", "info");
      } else {
        throw error;
      }
    } else {
      showToast("Application sent!", "success");
      triggerBtn.outerHTML = `<button class="btn btn-outline btn-sm applied-btn" disabled>Applied</button>`;
    }
    closeApplyDialog();
  } catch (err) {
    showToast(friendlyAuthError(err), "error");
  } finally {
    setButtonLoading(confirmBtn, false);
  }
}

// Backdrop click / Escape-to-close are handled generically by js/nav.js
// (any .modal-backdrop with .is-open) — this just wires the form itself.
function initApplyModal() {
  const textarea = document.getElementById("applyMessage");
  textarea.addEventListener("input", () => {
    document.getElementById("applyCharCount").textContent = textarea.value.length;
  });
  document.getElementById("applyCancelBtn").addEventListener("click", closeApplyDialog);
  document.getElementById("applyConfirmBtn").addEventListener("click", submitApplication);
}
