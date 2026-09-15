"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";
import type { ZoneTheme } from "@/types/database";

const VALID_THEMES: ZoneTheme[] = ["ink", "red", "blue", "acid"];

export async function createZone(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Not authorized.");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rawTheme = String(formData.get("theme") ?? "ink");
  const theme: ZoneTheme = VALID_THEMES.includes(rawTheme as ZoneTheme) ? (rawTheme as ZoneTheme) : "ink";
  if (!name) throw new Error("Name is required.");

  await ctx.admin.from("fault_zones").insert({ name, slug: slugify(name), description, theme });
  revalidatePath("/admin/zones");
}

export async function toggleZoneFeatured(zoneId: string, next: boolean) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Not authorized.");
  await ctx.admin.from("fault_zones").update({ is_featured: next }).eq("id", zoneId);
  revalidatePath("/admin/zones");
}

export async function toggleZoneArchived(zoneId: string, next: boolean) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Not authorized.");
  await ctx.admin.from("fault_zones").update({ is_archived: next }).eq("id", zoneId);
  revalidatePath("/admin/zones");
}
