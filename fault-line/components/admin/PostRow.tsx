"use client";

import { useTransition } from "react";
import { removePost, restorePost } from "@/app/admin/actions";

type Post = {
  id: string;
  content: string;
  status: string;
  risk_flag: boolean;
  created_at: string;
  profile?: { username: string };
};

export default function PostRow({ post }: { post: Post }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="border-2 border-paper/20 p-4">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-paper/50">
        <span>
          @{post.profile?.username} · {new Date(post.created_at).toLocaleString()}
          {post.risk_flag && <span className="ml-2 text-crack">⚠ RISK FLAG</span>}
        </span>
        <div className="space-x-2">
          {post.status === "removed" ? (
            <button
              disabled={pending}
              onClick={() => startTransition(() => restorePost(post.id))}
              className="border border-paper/30 px-2 py-1 hover:border-acid hover:text-acid"
            >
              restore
            </button>
          ) : (
            <button
              disabled={pending}
              onClick={() => startTransition(() => removePost(post.id, "Admin removal"))}
              className="border border-paper/30 px-2 py-1 hover:border-crack hover:text-crack"
            >
              remove
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-paper">{post.content}</p>
    </div>
  );
}
