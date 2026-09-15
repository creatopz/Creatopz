import { requireStaff } from "@/lib/admin";
import ReportRow from "@/components/admin/ReportRow";

export default async function AdminReportsPage() {
  const { supabase } = await requireStaff();

  const { data: reports } = await supabase
    .from("reports")
    .select("*, reporter:profiles!reports_reporter_id_fkey(username)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch the reported content itself so moderators don't need a second tab.
  const postIds = (reports ?? []).filter((r) => r.content_type === "post").map((r) => r.content_id);
  const { data: posts } = postIds.length
    ? await supabase.from("posts").select("id, content, status, user_id").in("id", postIds)
    : { data: [] };
  const postMap = Object.fromEntries((posts ?? []).map((p) => [p.id, p]));

  return (
    <div>
      <h1 className="font-grotesk text-3xl font-black uppercase">Moderation Queue.</h1>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-paper/50">
        {(reports ?? []).length} OPEN REPORTS
      </p>

      <div className="mt-6 space-y-3">
        {(reports ?? []).map((r) => (
          <ReportRow key={r.id} report={r as any} post={r.content_type === "post" ? postMap[r.content_id] : undefined} />
        ))}
        {(reports ?? []).length === 0 && (
          <p className="font-mono text-xs uppercase text-paper/50">Queue is empty. Nice.</p>
        )}
      </div>
    </div>
  );
}
