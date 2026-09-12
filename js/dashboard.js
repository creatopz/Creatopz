/**
 * Dashboard + onboarding logic shared by creator and brand pages.
 * Requires supabase-client.js, utils.js, auth.js.
 */

// ---------- Image upload ----------
// bucket: 'creator-avatars' | 'brand-logos'
async function uploadImage(file, bucket, userId) {
  if (!file) return null;
  const okTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!okTypes.includes(file.type)) {
    throw new Error("Please upload a JPG, PNG, WEBP, or GIF image.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be smaller than 5MB.");
  }
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabaseClient.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (uploadError) throw uploadError;
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ---------- Creator profile ----------
async function getMyCreatorProfile(userId) {
  const { data, error } = await supabaseClient
    .from("creators")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") console.error(error);
  return data || null;
}

async function saveCreatorProfile(userId, fields) {
  const payload = { ...fields, user_id: userId, updated_at: new Date().toISOString() };
  const { data, error } = await supabaseClient
    .from("creators")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

function creatorProfileCompletion(c) {
  if (!c) return 0;
  const checks = [
    !!c.profile_image,
    !!c.bio,
    !!c.category,
    !!c.followers,
    !!c.engagement_rate,
    !!(c.instagram_url || c.youtube_url || c.website_url),
    !!(c.audience_gender || c.demographics),
    !!(c.locations && c.locations.length),
    !!(c.content_types && c.content_types.length),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

// ---------- Brand profile ----------
async function getMyBrandProfile(userId) {
  const { data, error } = await supabaseClient
    .from("brands")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") console.error(error);
  return data || null;
}

async function saveBrandProfile(userId, fields) {
  const payload = { ...fields, user_id: userId, updated_at: new Date().toISOString() };
  const { data, error } = await supabaseClient
    .from("brands")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------- Campaigns (brand side) ----------
async function getMyCampaigns(brandId) {
  const { data, error } = await supabaseClient
    .from("campaigns")
    .select("*, campaign_applications(count)")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

async function createCampaign(brandId, fields) {
  const { data, error } = await supabaseClient
    .from("campaigns")
    .insert({ ...fields, brand_id: brandId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateCampaign(campaignId, fields) {
  const { data, error } = await supabaseClient
    .from("campaigns")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", campaignId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Uses a server-side function so the brand only ever gets the
// applicant's public info — never their contact links or rate.
// Final acceptance is handled by Creatopz admin, not the brand.
async function getApplicationsForCampaign(campaignId) {
  const { data, error } = await supabaseClient.rpc("get_campaign_applicants", {
    p_campaign_id: campaignId,
  });
  if (error) throw error;
  return data;
}

const STATUS_NOTIFICATIONS = {
  shortlisted: {
    title: "You've been shortlisted",
    message: "A brand shortlisted your application. Creatopz will be in touch to confirm details.",
  },
  accepted: {
    title: "Application accepted",
    message: "Your application was accepted! The Creatopz team will reach out with the contact details and agreed budget.",
  },
  rejected: {
    title: "Application update",
    message: "Your application status changed to rejected.",
  },
  withdrawn: {
    title: "Application withdrawn",
    message: "You withdrew this application.",
  },
};

async function setApplicationStatus(applicationId, status, creatorUserId, extraFields = {}) {
  const { error } = await supabaseClient
    .from("campaign_applications")
    .update({ status, updated_at: new Date().toISOString(), ...extraFields })
    .eq("id", applicationId);
  if (error) throw error;
  if (creatorUserId) {
    const copy = STATUS_NOTIFICATIONS[status] || {
      title: "Application update",
      message: `Your application status changed to ${status}.`,
    };
    await createNotification(creatorUserId, "application_status", copy.title, copy.message);
  }
}

// ---------- Creator: my applications ----------
async function getMyApplications(creatorId) {
  const { data, error } = await supabaseClient
    .from("campaign_applications")
    .select("*, campaigns(title, status, brand_id)")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const brandIds = [...new Set((data || []).map((a) => a.campaigns?.brand_id).filter(Boolean))];
  if (brandIds.length) {
    const { data: brandRows } = await supabaseClient
      .from("brands_public")
      .select("id, company_name")
      .in("id", brandIds);
    const brandsById = Object.fromEntries((brandRows || []).map((b) => [b.id, b]));
    (data || []).forEach((a) => {
      if (a.campaigns) a.campaigns.brands = brandsById[a.campaigns.brand_id] || null;
    });
  }
  return data;
}

// ---------- Notifications ----------
async function createNotification(userId, type, title, message) {
  await supabaseClient.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
  });
}

async function getMyNotifications(userId) {
  const { data, error } = await supabaseClient
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}

async function markNotificationRead(id) {
  await supabaseClient.from("notifications").update({ read: true }).eq("id", id);
}
