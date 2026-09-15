import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Re-checks admin/moderator status server-side on every admin page and every
 * admin server action — never trust the middleware bounce alone, since that
 * only protects page navigation, not direct calls to a server action.
 */
export async function requireStaff() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) {
    redirect("/cracks");
  }

  return { supabase, user, role: profile.role as "admin" | "moderator" };
}

export async function requireAdmin() {
  const ctx = await requireStaff();
  if (ctx.role !== "admin") redirect("/admin");
  return ctx;
}
