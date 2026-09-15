"use client";

import { useState, useTransition } from "react";
import { hidePost, unhidePost, resolveReport, setUserStatus } from "./actions";
import { cx } from "@/lib/utils";

type Report = {
  id: string;
  reason: string;
  status: string;
  post_id: string | null;
  comment_id: string | null;
  reported_user_id: string | null;
  reporter_id: string;
  created_at: string;
};

type Post = { id: string; content: string; is_hidden: boolean; author_id: string } | null;

export function ReportRow({
  report,
  post,
  reporterName,
  reportedName,
}: {
  report: Report;
  post: Post;
  reporterName: string;
  reportedName: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(report.status);

  return (
    <div className={cx("border p-5", localStatus === "open" ? "border-red" : "border-ink/20 opacity-70")}>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div>
          <p className="sys text-[10px] opacity-50">
            REPORTED BY {reporterName} · {new Date(report.created_at).toLocaleString("en-IN")}
          </p>
          {reportedName && <p className="sys text-[10px] opacity-50">TARGET USER: {reportedName}</p>}
        </div>
        <span className={cx("tag-chip", localStatus === "open" && "border-red text-red")}>{localStatus.toUpperCase()}</span>
      </div>

      <p className="text-sm mb-3">
        <span className="field-label mb-0 inline">Reason: </span>
        {report.reason}
      </p>

      {post && (
        <div className="border border-ink/15 bg-paper2 p-4 mb-4">
          <p className="sys text-[10px] opacity-50 mb-2">{post.is_hidden ? "CURRENTLY HIDDEN" : "CURRENTLY VISIBLE"}</p>
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {post &&
          (post.is_hidden ? (
            <button
              type="button"
              disabled={pending}
              className="tag-chip"
              onClick={() => startTransition(() => unhidePost(post.id))}
            >
              UNHIDE POST
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              className="tag-chip"
              style={{ borderColor: "#FF3B30", color: "#FF3B30" }}
              onClick={() => startTransition(() => hidePost(post.id, report.reason))}
            >
              HIDE POST
            </button>
          ))}

        {report.reported_user_id && (
          <>
            <button
              type="button"
              disabled={pending}
              className="tag-chip"
              onClick={() => startTransition(() => setUserStatus(report.reported_user_id!, "warned"))}
            >
              WARN USER
            </button>
            <button
              type="button"
              disabled={pending}
              className="tag-chip"
              onClick={() => startTransition(() => setUserStatus(report.reported_user_id!, "suspended"))}
            >
              SUSPEND USER
            </button>
            <button
              type="button"
              disabled={pending}
              className="tag-chip"
              style={{ borderColor: "#FF3B30", color: "#FF3B30" }}
              onClick={() => startTransition(() => setUserStatus(report.reported_user_id!, "banned"))}
            >
              BAN USER
            </button>
          </>
        )}

        {localStatus === "open" && (
          <>
            <button
              type="button"
              disabled={pending}
              className="tag-chip bg-ink text-paper"
              onClick={() =>
                startTransition(async () => {
                  await resolveReport(report.id, "resolved");
                  setLocalStatus("resolved");
                })
              }
            >
              MARK RESOLVED
            </button>
            <button
              type="button"
              disabled={pending}
              className="tag-chip"
              onClick={() =>
                startTransition(async () => {
                  await resolveReport(report.id, "dismissed");
                  setLocalStatus("dismissed");
                })
              }
            >
              DISMISS
            </button>
          </>
        )}
      </div>
    </div>
  );
}
