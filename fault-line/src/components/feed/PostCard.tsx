"use client";

import { useState } from "react";
import { AvatarRenderer } from "@/components/avatar/AvatarRenderer";
import { REACTION_KINDS } from "@/lib/posts";
import { formatRelativeTime, cx } from "@/lib/utils";
import { playSound } from "@/lib/sound";
import { DEFAULT_AVATAR_CONFIG, type Expression } from "@/lib/avatar";
import type { AvatarConfig } from "@/types/database";

export type FeedPost = {
  id: string;
  content: string;
  emotional_tags: string[];
  created_at: string;
  author: { id: string; anonymous_username: string; avatar_config: AvatarConfig; avatar_expression: string } | null;
  reactions: { kind: string; user_id: string }[];
};

export function PostCard({ post, currentUserId }: { post: FeedPost; currentUserId?: string }) {
  const [reactions, setReactions] = useState(post.reactions);
  const [mine, setMine] = useState<Set<string>>(
    () => new Set(post.reactions.filter((r) => r.user_id === currentUserId).map((r) => r.kind))
  );
  const [pending, setPending] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);

  const author = post.author;
  const isMine = author?.id === currentUserId;

  async function submitReport() {
    if (!reportReason.trim()) return;
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: post.id, reason: reportReason.trim() }),
    });
    if (res.ok) {
      setReportSent(true);
      setReporting(false);
      playSound("click");
    }
  }

  async function react(kind: string) {
    if (pending) return;
    setPending(kind);
    playSound("reaction");

    const wasMine = mine.has(kind);
    setMine((s) => {
      const next = new Set(s);
      wasMine ? next.delete(kind) : next.add(kind);
      return next;
    });
    setReactions((r) => {
      if (wasMine) {
        const idx = r.findIndex((x) => x.kind === kind && x.user_id === currentUserId);
        return idx === -1 ? r : [...r.slice(0, idx), ...r.slice(idx + 1)];
      }
      return [...r, { kind, user_id: currentUserId ?? "me" }];
    });

    const res = await fetch(`/api/posts/${post.id}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    setPending(null);
    if (!res.ok) {
      // revert optimistic update on failure
      setMine((s) => {
        const next = new Set(s);
        wasMine ? next.add(kind) : next.delete(kind);
        return next;
      });
    }
  }

  const counts = REACTION_KINDS.map((r) => ({
    ...r,
    count: reactions.filter((x) => x.kind === r.key).length,
  }));

  return (
    <article className="border border-ink/25 bg-paper p-5 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <AvatarRenderer
          config={author?.avatar_config ?? DEFAULT_AVATAR_CONFIG}
          expression={(author?.avatar_expression as Expression) ?? "neutral"}
          size={36}
        />
        <div>
          <p className="sys text-[11px]">{author?.anonymous_username ?? "deleted_user"}{isMine && " (you)"}</p>
          <p className="sys text-[10px] opacity-40">{formatRelativeTime(post.created_at)}</p>
        </div>
      </div>

      <p className="text-lg leading-snug whitespace-pre-wrap">{post.content}</p>

      {post.emotional_tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {post.emotional_tags.map((t) => (
            <span key={t} className="tag-chip" style={{ borderColor: "#245CFF", color: "#245CFF" }}>
              [ {t} ]
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-5">
        {counts.map((r) => (
          <button
            key={r.key}
            type="button"
            disabled={pending === r.key}
            onClick={() => react(r.key)}
            className={cx("tag-chip hover:bg-ink hover:text-paper transition-colors", mine.has(r.key) && "bg-ink text-paper")}
          >
            {r.label}
            {r.count > 0 && <span className="opacity-60"> · {r.count}</span>}
          </button>
        ))}

        {!isMine && !reportSent && (
          <button
            type="button"
            onClick={() => setReporting((v) => !v)}
            className="sys text-[10px] opacity-30 hover:opacity-70 ml-auto"
          >
            report
          </button>
        )}
        {reportSent && <span className="sys text-[10px] opacity-40 ml-auto">reported</span>}
      </div>

      {reporting && (
        <div className="mt-4 border-t border-ink/15 pt-4 flex gap-2">
          <input
            className="field flex-1"
            placeholder="what's wrong with this post?"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
          <button type="button" className="btn btn-outline whitespace-nowrap" onClick={submitReport}>
            SEND
          </button>
        </div>
      )}
    </article>
  );
}
