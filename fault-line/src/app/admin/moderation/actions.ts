"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";

type AdminCtx = NonNullable<Awaited<ReturnType<typeof requireAdmin>>>;

async function logAction(adminId: string, admin: AdminCtx["admin"], actionType: string, targetType: string, targetId: string | null, notes?: string) {
  await admin.from("admin_actions").insert({ admin_id: adminId, action_type: actionType, target_type: targetType, target_id: targetId, notes });
}

export async function hidePost(postId: string, reason: string) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Not authorized.");
  await ctx.admin.from("posts").update({ is_hidden: true, hidden_reason: reason || "Removed by moderation." }).eq("id", postId);
  await logAction(ctx.user.id, ctx.admin, "hide_post", "post", postId, reason);
  revalidatePath("/admin/moderation");
}

export async function unhidePost(postId: string) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Not authorized.");
  await ctx.admin.from("posts").update({ is_hidden: false, hidden_reason: null }).eq("id", postId);
  await logAction(ctx.user.id, ctx.admin, "unhide_post", "post", postId);
  revalidatePath("/admin/moderation");
}

export async function resolveReport(reportId: string, status: "resolved" | "dismissed") {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Not authorized.");
  await ctx.admin
    .from("reports")
    .update({ status, resolved_at: new Date().toISOString(), resolved_by: ctx.user.id })
    .eq("id", reportId);
  await logAction(ctx.user.id, ctx.admin, `report_${status}`, "report", reportId);
  revalidatePath("/admin/moderation");
}

export async function setUserStatus(userId: string, status: "active" | "warned" | "suspended" | "banned") {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Not authorized.");
  await ctx.admin.from("profiles").update({ status }).eq("id", userId);
  await logAction(ctx.user.id, ctx.admin, `set_status_${status}`, "user", userId);
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/users");
}
