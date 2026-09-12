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
  grid.innerHTML = `<p style="color:var(--grey);grid-column:1/-1;">Loading campaigns...</p>`;

  const { data, error } = await supabaseClient
    .from("campaigns_public")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    grid.innerHTML = `<p style="color:#B8493D;grid-column:1/-1;">Couldn't load campaigns. Please try again.</p>`;
    console.error(error);
    return;
  }

  if (!data.length) {
    grid.innerHTML = "";
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
    <div class="campaign-card" data-id="${c.id}">
      <div class="campaign-top">
        <div class="campaign-brand-logo">
          ${c.brands?.logo_url ? `<img src="${c.brands.logo_url}" alt="${escapeHtml(c.brands.company_name || "")}">` : `<span>${escapeHtml((c.brands?.company_name || "?")[0])}</span>`}
        </div>
        <div>
          <p class="campaign-brand-name">${escapeHtml(c.brands?.company_name || "Brand")}</p>
          <h3 class="campaign-title">${escapeHtml(c.title)}</h3>
        </div>
      </div>
      <p class="campaign-desc">${escapeHtml(c.description || "")}</p>
      <div class="campaign-meta">
        <span>${escapeHtml(c.niche || "General")}</span>
        <span>${(c.platforms || []).map(escapeHtml).join(", ") || "Any platform"}</span>
        <span>${formatBudget(c.budget_min, c.budget_max)}</span>
        <span>Deadline: ${formatDeadline(c.deadline)}</span>
        ${c.location ? `<span>${escapeHtml(c.location)}</span>` : ""}
      </div>
      ${
        canApply
          ? alreadyApplied
            ? `<button class="btn btn-outline-dark applied-btn" disabled style="width:100%;margin-top:16px;">Applied</button>`
            : `<button class="btn btn-red apply-btn" data-id="${c.id}" style="width:100%;margin-top:16px;">Apply</button>`
          : `<a href="signup.html" class="btn btn-outline-dark" style="width:100%;margin-top:16px;text-align:center;">Sign up to apply</a>`
      }
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
  document.getElementById("applyOverlay").classList.add("open");
  textarea.focus();
}

function closeApplyDialog() {
  document.getElementById("applyOverlay").classList.remove("open");
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
      triggerBtn.outerHTML = `<button class="btn btn-outline-dark applied-btn" disabled style="width:100%;margin-top:16px;">Applied</button>`;
    }
    closeApplyDialog();
  } catch (err) {
    showToast(friendlyAuthError(err), "error");
  } finally {
    setButtonLoading(confirmBtn, false);
  }
}

function initApplyModal() {
  const overlay = document.getElementById("applyOverlay");
  const textarea = document.getElementById("applyMessage");
  textarea.addEventListener("input", () => {
    document.getElementById("applyCharCount").textContent = textarea.value.length;
  });
  document.getElementById("applyCancelBtn").addEventListener("click", closeApplyDialog);
  document.getElementById("applyConfirmBtn").addEventListener("click", submitApplication);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeApplyDialog(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeApplyDialog();
  });
}
