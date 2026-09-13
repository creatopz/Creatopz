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

async function fetchOpenCampaigns() {
  const grid = document.getElementById("campaignGrid");
  const emptyState = document.getElementById("campaignEmptyState");
  grid.innerHTML = Array.from({ length: 6 }).map(() => `<div class="skeleton" style="height:260px;"></div>`).join("");

  const { data, error } = await supabaseClient
    .from("campaigns_public")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    grid.innerHTML = "";
    emptyState.innerHTML = `<div class="state-icon">!</div><h3>Something went wrong</h3><p>Couldn't load campaigns right now. Please try refreshing.</p>`;
    emptyState.style.display = "block";
    console.error(error);
    return;
  }

  if (!data.length) {
    grid.innerHTML = "";
    emptyState.innerHTML = `<div class="state-icon">◎</div><h3>No open campaigns yet</h3><p>Check back soon — new briefs go up regularly.</p>`;
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  const brandIds = [...new Set(data.map((c) => c.brand_id).filter(Boolean))];
  let brandsById = {};
  if (brandIds.length) {
    const { data: brandRows } = await supabaseClient
      .from("brands_public")
      .select("id, company_name, logo_url")
      .in("id", brandIds);
    brandsById = Object.fromEntries((brandRows || []).map((b) => [b.id, b]));
  }
  data.forEach((c) => (c.brands = brandsById[c.brand_id] || null));

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

  grid.innerHTML = data
    .map((c) => renderCampaignCard(c, appliedIds.has(c.id), profile))
    .join("");
  attachCampaignHandlers();
  if (typeof staggerInGrid === "function") staggerInGrid("#campaignGrid", ".campaign-card");
}

function renderCampaignCard(c, alreadyApplied, profile) {
  const canApply = profile && profile.role === "creator";
  return `
    <div class="campaign-card card-hover" data-id="${c.id}">
      <div class="cp-brand">
        <div class="avatar-fallback" style="width:44px;height:44px;border-radius:var(--r-md);overflow:hidden;font-size:16px;">
          ${c.brands?.logo_url ? `<img src="${escapeHtml(c.brands.logo_url)}" alt="${escapeHtml(c.brands.company_name || "")}" style="width:100%;height:100%;object-fit:cover;">` : escapeHtml((c.brands?.company_name || "?")[0])}
        </div>
        <div style="min-width:0;">
          <p class="caption" style="text-transform:uppercase;letter-spacing:.04em;">${escapeHtml(c.brands?.company_name || "Brand")}</p>
          <h3 class="cp-title">${escapeHtml(c.title)}</h3>
        </div>
      </div>
      <p class="cp-desc">${escapeHtml(c.description || "")}</p>
      <div class="cp-tags">
        <span class="badge">${escapeHtml(c.niche || "General")}</span>
        <span class="badge">${(c.platforms || []).map(escapeHtml).join(", ") || "Any platform"}</span>
        ${c.location ? `<span class="badge">${escapeHtml(c.location)}</span>` : ""}
      </div>
      <div class="cp-foot">
        <div>
          <div class="cp-budget">${formatBudget(c.budget_min, c.budget_max)}</div>
          <div class="caption">Deadline: ${formatDeadline(c.deadline)}</div>
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
