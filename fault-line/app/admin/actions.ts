"use server";

import { revalidatePath } from "next/cache";
import { requireStaff, requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

async function log(adminId: string, action: string, targetType: string, targetId: string | null, notes?: string) {
  const admin = createAdminClient();
  await admin.from("moderation_logs").insert({ admin_id: adminId, action, target_type: targetType, target_id: targetId, notes });
}

export async function suspendUser(userId: string, reason: string) {
  const { user } = await requireStaff();
  const admin = createAdminClient();
  await admin.from("profiles").update({ suspended: true, suspended_reason: reason }).eq("id", userId);
  await log(user.id, "suspend_user", "user", userId, reason);
  revalidatePath("/admin/users");
}

export async function unsuspendUser(userId: string) {
  const { user } = await requireStaff();
  const admin = createAdminClient();
  await admin.from("profiles").update({ suspended: false, suspended_reason: null }).eq("id", userId);
  await log(user.id, "unsuspend_user", "user", userId);
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const { user } = await requireAdmin();
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(userId); // cascades to profile, posts, comments, reactions
  await log(user.id, "delete_user", "user", userId);
  revalidatePath("/admin/users");
}

export async function removePost(postId: string, reason?: string) {
  const { user } = await requireStaff();
  const admin = createAdminClient();
  await admin.from("posts").update({ status: "removed" }).eq("id", postId);
  await log(user.id, "remove_post", "post", postId, reason);
  revalidatePath("/admin/posts");
  revalidatePath("/admin/reports");
}

export async function restorePost(postId: string) {
  const { user } = await requireStaff();
  const admin = createAdminClient();
  await admin.from("posts").update({ status: "visible" }).eq("id", postId);
  await log(user.id, "restore_post", "post", postId);
  revalidatePath("/admin/posts");
}

export async function resolveReport(reportId: string, status: "dismissed" | "actioned") {
  const { user } = await requireStaff();
  const admin = createAdminClient();
  await admin.from("reports").update({ status }).eq("id", reportId);
  await log(user.id, `report_${status}`, "report", reportId);
  revalidatePath("/admin/reports");
}

export async function createCommunity(data: { slug: string; name: string; description: string; icon: string; tags: string[] }) {
  const { user } = await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("communities").insert(data);
  await log(user.id, "create_community", "community", null, data.slug);
  revalidatePath("/admin/communities");
  revalidatePath("/communities");
  return { error: error?.message ?? null };
}

export async function deleteCommunity(id: string) {
  const { user } = await requireAdmin();
  const admin = createAdminClient();
  await admin.from("communities").delete().eq("id", id);
  await log(user.id, "delete_community", "community", id);
  revalidatePath("/admin/communities");
  revalidatePath("/communities");
}
