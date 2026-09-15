import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";

function BarList({ items, accent }: { items: { label: string; value: number }[]; accent: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="flex flex-col gap-3">
      {items.map((i) => (
        <div key={i.label}>
          <div className="flex justify-between mb-1">
            <span className="sys text-[11px]">{i.label}</span>
            <span className="font-mono text-[11px] opacity-60">{i.value}</span>
          </div>
          <div className="h-2 bg-ink/10">
            <div className="h-2" style={{ width: `${(i.value / max) * 100}%`, background: accent }} />
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="opacity-50 text-sm">Not enough data yet.</p>}
    </div>
  );
}

export default async function AnalyticsPage() {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const { admin } = ctx;

  const since = new Date();
  since.setDate(since.getDate() - 14);

  const [{ data: recentProfiles }, { data: recentPosts }, { data: zones }, { count: totalReactions }, { count: totalPosts }] =
    await Promise.all([
      admin.from("profiles").select("created_at").gte("created_at", since.toISOString()),
      admin.from("posts").select("emotional_tags, zone_id, author_id").order("created_at", { ascending: false }).limit(500),
      admin.from("fault_zones").select("id, name"),
      admin.from("reactions").select("id", { count: "exact", head: true }),
      admin.from("posts").select("id", { count: "exact", head: true }),
    ]);

  // growth: signups per day, last 14 days
  const dayBuckets = new Map<string, number>();
  for (const p of recentProfiles ?? []) {
    const day = p.created_at.slice(0, 10);
    dayBuckets.set(day, (dayBuckets.get(day) ?? 0) + 1);
  }
  const growth = [...dayBuckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, value }));

  // popular emotional tags
  const tagCounts = new Map<string, number>();
  for (const p of recentPosts ?? []) {
    for (const t of p.emotional_tags ?? []) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  }
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }));

  // most active zones
  const zoneNames = new Map((zones ?? []).map((z) => [z.id, z.name]));
  const zoneCounts = new Map<string, number>();
  for (const p of recentPosts ?? []) {
    if (!p.zone_id) continue;
    zoneCounts.set(p.zone_id, (zoneCounts.get(p.zone_id) ?? 0) + 1);
  }
  const topZones = [...zoneCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, value]) => ({ label: zoneNames.get(id) ?? "unknown zone", value }));

  // retention (of the sampled 500 most recent posts): share of authors who posted more than once
  const authorCounts = new Map<string, number>();
  for (const p of recentPosts ?? []) authorCounts.set(p.author_id, (authorCounts.get(p.author_id) ?? 0) + 1);
  const repeatAuthors = [...authorCounts.values()].filter((c) => c > 1).length;
  const retentionPct = authorCounts.size > 0 ? Math.round((repeatAuthors / authorCounts.size) * 100) : 0;

  const engagementRatio = totalPosts ? ((totalReactions ?? 0) / totalPosts).toFixed(1) : "0";

  return (
    <div>
      <h1 className="font-grotesk font-black uppercase text-3xl mb-8">ANALYTICS</h1>

      <div className="grid sm:grid-cols-3 gap-5 mb-10">
        <div className="border border-ink p-5">
          <p className="sys text-[10px] opacity-50 mb-2">REACTIONS PER POST</p>
          <p className="font-grotesk font-black text-3xl">{engagementRatio}</p>
        </div>
        <div className="border border-ink p-5">
          <p className="sys text-[10px] opacity-50 mb-2">REPEAT-POSTER RATE (LAST 500 POSTS)</p>
          <p className="font-grotesk font-black text-3xl">{retentionPct}%</p>
        </div>
        <div className="border border-ink p-5">
          <p className="sys text-[10px] opacity-50 mb-2">SIGNUPS, LAST 14 DAYS</p>
          <p className="font-grotesk font-black text-3xl">{(recentProfiles ?? []).length}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <section>
          <h2 className="font-grotesk font-black uppercase text-lg mb-4">GROWTH</h2>
          <BarList items={growth} accent="#245CFF" />
        </section>
        <section>
          <h2 className="font-grotesk font-black uppercase text-lg mb-4">MOST ACTIVE FAULT ZONES</h2>
          <BarList items={topZones} accent="#FF3B30" />
        </section>
        <section>
          <h2 className="font-grotesk font-black uppercase text-lg mb-4">POPULAR EMOTIONAL CATEGORIES</h2>
          <BarList items={topTags} accent="#C7FF00" />
        </section>
      </div>
    </div>
  );
}
