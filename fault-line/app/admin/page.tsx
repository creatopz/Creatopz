import { requireStaff } from "@/lib/admin";

export default async function AdminDashboard() {
  const { supabase } = await requireStaff();

  const since24h = new Date(Date.now() - 86400000).toISOString();
  const since7d = new Date(Date.now() - 7 * 86400000).toISOString();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: postsToday },
    { count: pendingReports },
    { data: subs },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }).gte("created_at", since7d),
    supabase.from("posts").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("subscriptions").select("plan, amount_paise, payment_status").eq("payment_status", "paid"),
  ]);

  const revenue = (subs ?? []).reduce((sum, s) => sum + (s.amount_paise ?? 0), 0) / 100;
  const byPlan: Record<string, number> = {};
  (subs ?? []).forEach((s) => (byPlan[s.plan] = (byPlan[s.plan] ?? 0) + 1));

  const stats = [
    { label: "TOTAL USERS", value: totalUsers ?? 0 },
    { label: "POSTS (7D)", value: activeUsers ?? 0 },
    { label: "POSTS TODAY", value: postsToday ?? 0 },
    { label: "REPORTS PENDING", value: pendingReports ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-grotesk text-3xl font-black uppercase">Dashboard.</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border-2 border-paper/20 p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-paper/50">{s.label}</p>
            <p className="mt-2 font-grotesk text-4xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 border-2 border-paper/20 p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-paper/50">SUBSCRIPTION REVENUE (PAID, ALL-TIME)</p>
        <p className="mt-2 font-grotesk text-4xl font-black">₹{revenue.toLocaleString("en-IN")}</p>
        <div className="mt-4 flex gap-6 font-mono text-xs uppercase tracking-widest text-paper/70">
          <span>MONTHLY: {byPlan.monthly ?? 0}</span>
          <span>YEARLY: {byPlan.yearly ?? 0}</span>
          <span>LIFETIME: {byPlan.lifetime ?? 0}</span>
        </div>
      </div>
    </div>
  );
}
