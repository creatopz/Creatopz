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
async function ensureProfileRow(user) {
  const role = user.user_metadata?.role === "brand" ? "brand" : "creator";
  const fullName = user.user_metadata?.full_name || "";
  const { data: profile } = await supabaseClient
    .from("profiles")
    .upsert({ id: user.id, role, full_name: fullName, email: user.email }, { onConflict: "id", ignoreDuplicates: false })
    .select()
    .single();

  const table = role === "brand" ? "brands" : "creators";
  const { data: existing } = await supabaseClient.from(table).select("id").eq("user_id", user.id).maybeSingle();
  if (!existing) {
    await supabaseClient.from(table).insert(
      role === "brand" ? { user_id: user.id, company_name: fullName } : { user_id: user.id, name: fullName }
    );
  }
  return profile || { id: user.id, email: user.email, role, full_name: fullName };
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
