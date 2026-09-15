"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";

export async function setUserRole(userId: string, role: "user" | "moderator" | "admin") {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Not authorized.");
  // only a full admin (not a moderator) may grant admin/moderator roles
  if (ctx.profile.role !== "admin") throw new Error("Only an admin can change roles.");

  await ctx.admin.from("profiles").update({ role }).eq("id", userId);
  await ctx.admin.from("admin_actions").insert({
    admin_id: ctx.user.id,
    action_type: `set_role_${role}`,
    target_type: "user",
    target_id: userId,
  });
  revalidatePath("/admin/users");
}
