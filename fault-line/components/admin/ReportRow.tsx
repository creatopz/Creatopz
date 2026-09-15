"use client";

import { useTransition } from "react";
import { removePost, resolveReport, suspendUser } from "@/app/admin/actions";

type Report = {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  created_at: string;
  reporter?: { username: string };
};

type Post = { id: string; content: string; status: string; user_id: string };

export default function ReportRow({ report, post }: { report: Report; post?: Post }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="border-2 border-crack/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-paper/50">
        <span>
          {report.content_type} · reported by @{report.reporter?.username ?? "unknown"} ·{" "}
          {new Date(report.created_at).toLocaleString()}
        </span>
      </div>
      <p className="mt-1 font-mono text-xs uppercase text-crack">REASON: {report.reason}</p>

      {post && (
        <p className="mt-3 border-l-2 border-paper/20 pl-3 text-sm text-paper/90">{post.content}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-widest">
        <button
          disabled={pending}
          onClick={() => startTransition(() => resolveReport(report.id, "dismissed"))}
          className="border border-paper/30 px-2.5 py-1.5 hover:border-acid hover:text-acid"
        >
          dismiss
        </button>
        {post && post.status !== "removed" && (
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await removePost(post.id, report.reason);
                await resolveReport(report.id, "actioned");
              })
            }
            className="border border-crack px-2.5 py-1.5 text-crack hover:bg-crack hover:text-paper"
          >
            remove content
          </button>
        )}
        {post && (
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await suspendUser(post.user_id, `Reported: ${report.reason}`);
                await resolveReport(report.id, "actioned");
              })
            }
            className="border border-crack px-2.5 py-1.5 text-crack hover:bg-crack hover:text-paper"
          >
            suspend author
          </button>
        )}
      </div>
    </div>
  );
}
