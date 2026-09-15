import { requireStaff } from "@/lib/admin";
import PostRow from "@/components/admin/PostRow";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const { supabase } = await requireStaff();
  const status = searchParams.status ?? "visible";

  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, status, risk_flag, created_at, profile:profiles(username)")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="font-grotesk text-3xl font-black uppercase">Posts.</h1>
      <div className="mt-4 flex gap-2 font-mono text-[10px] uppercase tracking-widest">
        {["visible", "under_review", "removed"].map((s) => (
          <a
            key={s}
            href={`/admin/posts?status=${s}`}
            className={`border px-3 py-1.5 ${status === s ? "border-acid text-acid" : "border-paper/30 text-paper/60"}`}
          >
            {s.replace("_", " ")}
          </a>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {(posts ?? []).map((p) => (
          <PostRow key={p.id} post={p as any} />
        ))}
        {(posts ?? []).length === 0 && (
          <p className="font-mono text-xs uppercase text-paper/50">Nothing here.</p>
        )}
      </div>
    </div>
  );
}
