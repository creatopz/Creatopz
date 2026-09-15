"use client";

import { useState, useTransition } from "react";
import { REACTION_TYPES, ReactionType } from "@/lib/types";
import { useSound } from "@/components/providers/SoundProvider";

const ICONS: Record<ReactionType, string> = {
  same_here: "▤",
  feel_this: "♥",
  not_alone: "☍",
  ouch: "◈",
  too_real: "▲",
};

export default function ReactionBar({
  postId,
  counts,
  myReaction,
  isAuthed,
}: {
  postId: string;
  counts: Partial<Record<ReactionType, number>>;
  myReaction: ReactionType | null;
  isAuthed: boolean;
}) {
  const [local, setLocal] = useState({ counts, mine: myReaction });
  const [pending, startTransition] = useTransition();
  const { play } = useSound();

  const react = async (type: ReactionType) => {
    if (!isAuthed) {
      window.location.href = "/auth/login";
      return;
    }
    play("pop");
    const wasMine = local.mine === type;
    const nextMine = wasMine ? null : type;

    setLocal((prev) => {
      const counts = { ...prev.counts };
      if (prev.mine) counts[prev.mine] = Math.max(0, (counts[prev.mine] ?? 1) - 1);
      if (nextMine) counts[nextMine] = (counts[nextMine] ?? 0) + 1;
      return { counts, mine: nextMine };
    });

    startTransition(async () => {
      try {
        await fetch(`/api/posts/${postId}/reactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reaction_type: type }),
        });
      } catch {
        /* optimistic UI already reflects intent; a background refresh will reconcile */
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="React to this confession">
      {REACTION_TYPES.map(({ key, label }) => {
        const active = local.mine === key;
        return (
          <button
            key={key}
            type="button"
            disabled={pending && active}
            onClick={() => react(key)}
            data-cursor="FEEL THIS"
            aria-pressed={active}
            className={`flex items-center gap-1 border font-mono text-[10px] uppercase tracking-wide transition-colors ${
              active
                ? "border-ink bg-ink text-paper"
                : "border-ink/30 bg-transparent text-ink hover:border-ink"
            } px-2 py-1`}
          >
            <span aria-hidden>{ICONS[key]}</span>
            {label}
            {local.counts[key] ? <span className="opacity-60">{local.counts[key]}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
