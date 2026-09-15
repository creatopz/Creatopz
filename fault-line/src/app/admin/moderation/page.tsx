import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { ReportRow } from "./ReportRow";

export default async function ModerationPage() {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const { admin } = ctx;

  const { data: reports } = await admin
    .from("reports")
    .select("id, reason, status, post_id, comment_id, reported_user_id, reporter_id, created_at")
    .order("status", { ascending: true }) // 'open' sorts before others alphabetically-ish; fine for a small queue
    .order("created_at", { ascending: false })
    .limit(100);

  const postIds = [...new Set((reports ?? []).map((r) => r.post_id).filter(Boolean))] as string[];
  const userIds = [
    ...new Set((reports ?? []).flatMap((r) => [r.reported_user_id, r.reporter_id]).filter(Boolean)),
  ] as string[];

  const [{ data: posts }, { data: users }] = await Promise.all([
    postIds.length ? admin.from("posts").select("id, content, is_hidden, author_id").in("id", postIds) : Promise.resolve({ data: [] }),
    userIds.length ? admin.from("profiles").select("id, anonymous_username").in("id", userIds) : Promise.resolve({ data: [] }),
  ]);

  const postMap = new Map((posts ?? []).map((p) => [p.id, p]));
  const userMap = new Map((users ?? []).map((u) => [u.id, u.anonymous_username]));

  return (
    <div>
      <h1 className="font-grotesk font-black uppercase text-3xl mb-8">MODERATION QUEUE</h1>

      {(reports ?? []).length === 0 && <p className="opacity-50 text-sm">No reports. Quiet in here.</p>}

      <div className="flex flex-col gap-4">
        {(reports ?? []).map((r) => (
          <ReportRow
            key={r.id}
            report={r}
            post={r.post_id ? postMap.get(r.post_id) ?? null : null}
            reporterName={userMap.get(r.reporter_id) ?? "unknown"}
            reportedName={r.reported_user_id ? userMap.get(r.reported_user_id) ?? "unknown" : null}
          />
        ))}
      </div>
    </div>
  );
}
