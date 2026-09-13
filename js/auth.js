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

async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) return { id: user.id, email: user.email, role: user.user_metadata?.role };
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
async function renderAuthNav(navSelector = "#authNav") {
  const nav = document.querySelector(navSelector);
  if (!nav) return;
  const profile = await getCurrentProfile();
  if (!profile) {
    nav.innerHTML = `<a href="auth.html" class="btn btn-outline btn-sm">Log in</a><a href="auth.html?mode=signup" class="btn btn-primary btn-sm"><span class="hide-xs">Join as</span> Creator</a>`;
    return;
  }
  const dashboardHref =
    profile.role === "admin"
      ? "admin-console.html"
      : profile.role === "brand"
      ? "dashboard-brand.html"
      : "dashboard-creator.html";
  const onDashboardAlready = window.location.pathname.endsWith(dashboardHref);
  nav.innerHTML = `
    ${onDashboardAlready ? "" : `<a href="${dashboardHref}" class="btn btn-outline btn-sm">Dashboard</a>`}
    <a href="#" id="navLogout" class="btn btn-primary btn-sm">Log out</a>
  `;
  document.getElementById("navLogout")?.addEventListener("click", async (e) => {
    e.preventDefault();
    await logOut();
  });
}
