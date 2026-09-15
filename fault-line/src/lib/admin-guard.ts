import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * The one place that decides "is this request allowed to act as an admin".
 * Called at the top of the admin layout AND independently inside every
 * admin server action / API route — never trust that a caller reached you
 * through the gated layout, since server actions can be invoked directly.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, anonymous_username, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) return null;

  return { user, profile, admin: createAdminClient() };
}
