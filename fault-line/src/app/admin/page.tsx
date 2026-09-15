import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="border border-ink bg-paper p-6">
      <p className="sys text-[10px] opacity-50 mb-3">{label}</p>
      <p className="font-grotesk font-black text-4xl" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}

export default async function AdminDashboard() {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const { admin } = ctx;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: totalUsers },
    { count: postsToday },
    { count: totalPosts },
    { count: activeSubs },
    { count: openReports },
    { data: revenueRows },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("posts").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    admin.from("posts").select("id", { count: "exact", head: true }),
    admin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    admin.from("subscriptions").select("amount_paise").eq("status", "active"),
  ]);

  const revenuePaise = (revenueRows ?? []).reduce((sum, r) => sum + r.amount_paise, 0);
  const revenueRupees = (revenuePaise / 100).toLocaleString("en-IN");

  return (
    <div>
      <h1 className="font-grotesk font-black uppercase text-3xl mb-8">DASHBOARD</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard label="TOTAL USERS" value={totalUsers ?? 0} />
        <StatCard label="POSTS TODAY" value={postsToday ?? 0} accent="#245CFF" />
        <StatCard label="TOTAL POSTS" value={totalPosts ?? 0} />
        <StatCard label="ACTIVE SUBSCRIPTIONS" value={activeSubs ?? 0} accent="#245CFF" />
        <StatCard label="REVENUE (ACTIVE)" value={`₹${revenueRupees}`} accent="#C7FF00" />
        <StatCard label="OPEN REPORTS" value={openReports ?? 0} accent={openReports ? "#FF3B30" : undefined} />
      </div>

      {openReports! > 0 && (
        <div className="border-2 border-red bg-red/5 p-5 flex items-center justify-between flex-wrap gap-3">
          <p className="font-grotesk font-black uppercase">
            {openReports} REPORT{openReports === 1 ? "" : "S"} NEED{openReports === 1 ? "S" : ""} REVIEW.
          </p>
          <Link href="/admin/moderation" className="btn">
            GO TO MODERATION →
          </Link>
        </div>
      )}
    </div>
  );
}
