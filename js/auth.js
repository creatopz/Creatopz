/**
 * Authentication helpers built on Supabase Auth.
 * Requires supabase-client.js and utils.js to be loaded first.
 */

// ---------- Sign up ----------
// role: 'creator' | 'brand'
async function signUp(email, password, role, fullName) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name: fullName || "" },
      emailRedirectTo: window.location.origin + "/login.html",
    },
  });
  if (error) throw error;

  // Create the central profile row. If email confirmation is required,
  // data.user will still exist (unconfirmed) so this is safe to do now.
  if (data.user) {
    await supabaseClient.from("profiles").upsert({
      id: data.user.id,
      role,
      full_name: fullName || "",
      email,
    });
  }
  return data;
}

// ---------- Login ----------
async function logIn(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// ---------- Logout ----------
async function logOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
  window.location.href = "index.html";
}

// ---------- Forgot / reset password ----------
async function sendPasswordReset(email) {
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset-password.html",
  });
  if (error) throw error;
}

async function updatePassword(newPassword) {
  const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// ---------- Session / role helpers ----------
async function getCurrentUser() {
  const { data } = await supabaseClient.auth.getUser();
  return data.user || null;
}

// Self-healing: signup can happen without an active session (email
// confirmation pending), in which case RLS blocks writing the profiles
// row at signup time. The first time that user is seen with a real
// session (i.e. here), make sure their profiles/creators/brands rows
// exist so nothing downstream (dashboards, admin, onboarding) 404s on
// a profile that was never created.
//
// IMPORTANT: this must only ever CREATE a missing row, never touch an
// existing one's role/email/full_name. auth.html calls this on every
// login (not just first login) — an upsert here previously reset
// `role` back to the signup-time default from user_metadata on every
// login, which silently downgraded the one admin account back to
// 'creator' every time it logged in.
async function ensureProfileRow(user) {
  const metaRole = user.user_metadata?.role === "brand" ? "brand" : "creator";
  const fullName = user.user_metadata?.full_name || "";

  let { data: profile } = await supabaseClient.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) {
    const { data: inserted, error } = await supabaseClient
      .from("profiles")
      .insert({ id: user.id, role: metaRole, full_name: fullName, email: user.email })
      .select()
      .single();
    if (error) {
      // Lost a race to create it (e.g. two tabs) — read back whatever's there.
      const { data: raced } = await supabaseClient.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (!raced) throw error;
      profile = raced;
    } else {
      profile = inserted;
    }
  }

  // Only creators/brands have a matching sub-table row — never create
  // one for an admin account.
  if (profile.role === "creator" || profile.role === "brand") {
    const table = profile.role === "brand" ? "brands" : "creators";
    const { data: existingSub } = await supabaseClient.from(table).select("id").eq("user_id", user.id).maybeSingle();
    if (!existingSub) {
      // The niche picked during signup (auth.html step 3) lives in
      // user_metadata.category, not just that page's own JS state,
      // specifically so it survives here -- this is the only place a
      // delayed-email-confirmation signup ever gets its creators row
      // written, and without this it would create the row with no
      // category and silently drop what the creator picked at signup.
      const category = typeof user.user_metadata?.category === "string" ? user.user_metadata.category : null;
      const { data: inserted } = await supabaseClient.from(table).insert(
        table === "brands"
          ? { user_id: user.id, company_name: profile.full_name || fullName }
          : { user_id: user.id, name: profile.full_name || fullName, category }
      ).select().single();
      // Same reasoning as category above: the referral code entered at
      // signup (auth.html step 2) only survives to here via
      // user_metadata, for a signup whose email confirmation delayed
      // the session past the point RLS would allow this insert.
      const referralCode = typeof user.user_metadata?.referral_code_used === "string" ? user.user_metadata.referral_code_used : null;
      if (table === "creators" && inserted && referralCode) {
        await supabaseClient.rpc("apply_referral_code", { target_creator_id: inserted.id, code: referralCode });
      }
    }
  }
  return profile;
}

async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) {
    // No row yet (e.g. first login after email confirmation) — create it.
    try {
      return await ensureProfileRow(user);
    } catch {
      return { id: user.id, email: user.email, role: user.user_metadata?.role || "creator" };
    }
  }
  return data;
}

// Redirects away if not logged in, or if logged in with the wrong role.
// requiredRole: 'creator' | 'brand' | 'admin' | null (null = just needs to be logged in)
async function requireAuth(requiredRole = null) {
  const profile = await getCurrentProfile();
  if (!profile) {
    if (!window.location.pathname.endsWith("auth.html")) {
      window.location.href = "auth.html";
    }
    return null;
  }
  if (requiredRole && profile.role !== requiredRole) {
    const target =
      profile.role === "admin"
        ? "admin-console.html"
        : profile.role === "brand"
        ? "dashboard-brand.html"
        : "dashboard-creator.html";
    // Never redirect to the page we're already on — that would be an
    // infinite reload loop instead of a redirect.
    if (!window.location.pathname.endsWith(target)) {
      window.location.href = target;
    }
    return null;
  }
  return profile;
}

// Updates the nav bar (if present on the page) to reflect logged-in state.
// Also syncs the mobile drawer's action buttons (.nav-drawer-actions), if
// the page has one — it starts out with static "Log in / Join" markup so
// a logged-in visitor doesn't see the wrong buttons after opening the
// hamburger menu.
async function renderAuthNav(navSelector = "#authNav") {
  const nav = document.querySelector(navSelector);
  const drawerActions = document.querySelector(".nav-drawer-actions[data-auth-sync]");
  if (!nav && !drawerActions) return;
  const profile = await getCurrentProfile();

  const wireLogout = (id) => {
    document.getElementById(id)?.addEventListener("click", async (e) => {
      e.preventDefault();
      await logOut();
    });
  };

  if (!profile) {
    if (nav) {
      nav.innerHTML = `<a href="auth.html" class="btn btn-outline btn-sm">Log in</a><a href="auth.html?mode=signup" class="btn btn-primary btn-sm"><span class="hide-xs">Join as</span> Creator</a>`;
    }
    if (drawerActions) {
      drawerActions.innerHTML = `<a href="auth.html" class="btn btn-outline on-dark btn-block btn-lg">Log in</a><a href="auth.html?mode=signup" class="btn btn-white btn-block btn-lg">Join Creatopz</a>`;
    }
    return;
  }

  const dashboardHref =
    profile.role === "admin"
      ? "admin-console.html"
      : profile.role === "brand"
      ? "dashboard-brand.html"
      : "dashboard-creator.html";
  const onDashboardAlready = window.location.pathname.endsWith(dashboardHref);

  if (nav) {
    nav.innerHTML = `
      ${onDashboardAlready ? "" : `<a href="${dashboardHref}" class="btn btn-outline btn-sm">Dashboard</a>`}
      <a href="#" id="navLogout" class="btn btn-primary btn-sm">Log out</a>
    `;
    wireLogout("navLogout");
  }
  if (drawerActions) {
    drawerActions.innerHTML = `
      ${onDashboardAlready ? "" : `<a href="${dashboardHref}" class="btn btn-outline on-dark btn-block btn-lg">Dashboard</a>`}
      <a href="#" id="navLogoutDrawer" class="btn btn-white btn-block btn-lg">Log out</a>
    `;
    wireLogout("navLogoutDrawer");
  }
}
