import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Fault Zones" };

const ACCENT: Record<string, string> = { red: "#FF3B30", blue: "#245CFF", acid: "#C7FF00", ink: "#111111" };

export default async function ZonesPage() {
  const supabase = await createClient();
  const { data: zones } = await supabase
    .from("fault_zones")
    .select("id, slug, name, description, theme, is_featured")
    .eq("is_archived", false)
    .order("is_featured", { ascending: false })
    .order("name");

  const memberCounts = new Map<string, number>();
  if (zones) {
    await Promise.all(
      zones.map(async (z) => {
        const { count } = await supabase
          .from("zone_members")
          .select("user_id", { count: "exact", head: true })
          .eq("zone_id", z.id);
        memberCounts.set(z.id, count ?? 0);
      })
    );
  }

  return (
    <div className="px-5 md:px-10 py-16 md:py-24">
      <div className="mx-auto max-w-[1600px]">
        <p className="sys text-xs opacity-60 mb-3">ANONYMOUS COMMUNITIES</p>
        <h1 className="font-grotesk font-black uppercase text-huge max-w-[20ch] mb-14">FAULT ZONES.</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {(zones ?? []).map((z) => (
            <Link
              key={z.id}
              href={`/zones/${z.slug}`}
              className="relative p-6 border border-ink bg-paper hover:-translate-y-1 hover:shadow-[4px_4px_0_#111] transition-transform block"
            >
              {z.is_featured && (
                <span className="tag-chip absolute top-5 right-5" style={{ borderColor: "#245CFF", color: "#245CFF" }}>
                  FEATURED
                </span>
              )}
              <div className="w-3 h-3 mb-4" style={{ background: ACCENT[z.theme] ?? "#111" }} />
              <h2 className="font-grotesk font-black uppercase text-lg mb-2">{z.name}</h2>
              <p className="text-sm opacity-70 mb-4">{z.description}</p>
              <p className="sys text-[11px] opacity-50">
                {memberCounts.get(z.id) ?? 0} PEOPLE GET THIS.
              </p>
            </Link>
          ))}
          {(zones ?? []).length === 0 && <p className="opacity-50 text-sm">No zones yet — check back soon.</p>}
        </div>
      </div>
    </div>
  );
}
