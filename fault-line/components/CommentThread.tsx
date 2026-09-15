"use client";

import { useState } from "react";
import PixelAvatar from "@/components/PixelAvatar";
import { DEFAULT_AVATAR } from "@/lib/types";
import { faultTimestamp } from "@/lib/time";
import { useSound } from "@/components/providers/SoundProvider";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  profile?: { username: string; avatar_config: typeof DEFAULT_AVATAR; privacy_level: string };
};

export default function CommentThread({
  postId,
  initialComments,
  isAuthed,
}: {
  postId: string;
  initialComments: Comment[];
  isAuthed: boolean;
}) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { play } = useSound();

  const submit = async () => {
    if (!text.trim()) return;
    if (!isAuthed) {
      window.location.href = "/auth/login";
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });
      if (res.ok) {
        const { comment } = await res.json();
        setComments((prev) => [...prev, comment]);
        setText("");
        play("tick");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <p className="font-mono text-[10px] uppercase tracking-widest text-grey">
        {comments.length} {comments.length === 1 ? "RESPONSE" : "RESPONSES"}
      </p>

      <div className="mt-4 space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <PixelAvatar config={c.profile?.avatar_config ?? DEFAULT_AVATAR} size={28} />
            <div>
              <p className="font-mono text-[10px] uppercase text-grey">
                {c.profile?.privacy_level === "anonymous" ? "anonymous-ish" : c.profile?.username}{" "}
                · {faultTimestamp(c.created_at)}
              </p>
              <p className="mt-0.5 text-sm text-ink">{c.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          placeholder="say something back..."
          className="flex-1 border-2 border-ink bg-transparent px-3 py-2 text-sm outline-none focus:bg-white"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="border-2 border-ink bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-paper disabled:opacity-50"
        >
          SEND
        </button>
      </div>
    </div>
  );
}
