"use client";

import { useState, useTransition } from "react";
import { Community } from "@/lib/types";

export default function CommunityCard({
  community,
  isAuthed,
}: {
  community: Community;
  isAuthed: boolean;
}) {
  const [joined, setJoined] = useState(!!community.is_member);
  const [count, setCount] = useState(community.member_count ?? 0);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    if (!isAuthed) {
      window.location.href = "/auth/login";
      return;
    }
    const next = !joined;
    setJoined(next);
    setCount((c) => c + (next ? 1 : -1));
    startTransition(async () => {
      await fetch(`/api/communities/${community.id}/join`, {
        method: next ? "POST" : "DELETE",
      });
    });
  };

  return (
    <div className="pixel-corners flex flex-col justify-between border-2 border-ink bg-paper p-5 shadow-[4px_4px_0_#111]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-2xl" aria-hidden>
            {community.icon}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-grey">
            {count.toLocaleString()} HUMANS
          </span>
        </div>
        <h3 className="font-grotesk text-xl font-black uppercase leading-tight">{community.name}</h3>
        <p className="mt-2 text-sm text-ink/80">{community.description}</p>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`mt-4 border-2 border-ink px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
          joined ? "bg-ink text-paper" : "bg-transparent text-ink hover:bg-ink hover:text-paper"
        }`}
      >
        {joined ? "YOU'RE IN" : "JOIN"}
      </button>
    </div>
  );
}
