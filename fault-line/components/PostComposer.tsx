"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { randomPrompt } from "@/lib/prompts";
import { detectRiskSignal } from "@/lib/safety";
import SafetyResourceModal from "@/components/SafetyResourceModal";
import { useSound } from "@/components/providers/SoundProvider";

const MAX_LEN = 500;

export default function PostComposer({ communityId }: { communityId?: string }) {
  const [prompt] = useState(randomPrompt);
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { play } = useSound();
  const router = useRouter();

  const honestyLoaded = Math.min(100, Math.round((text.trim().length / 120) * 100));

  const submit = async (bypassSafety = false) => {
    if (!text.trim()) return;
    if (!bypassSafety && detectRiskSignal(text)) {
      setShowSafety(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text.trim(),
          visibility: anonymous ? "anonymous" : "public",
          community_id: communityId ?? null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not post. Try again.");
      }
      play("flip");
      setText("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-2 border-ink bg-paper p-5 shadow-[4px_4px_0_#111]">
      <p className="font-mono text-[11px] uppercase tracking-widest text-crack">{prompt}</p>
      <div className="relative mt-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
          rows={4}
          maxLength={MAX_LEN}
          placeholder="Type it. Nobody's grading this."
          aria-label="Write your confession"
          className="w-full resize-none border-2 border-ink bg-transparent p-3 font-grotesk text-lg leading-snug text-ink outline-none placeholder:text-grey"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-ink/70">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="h-3.5 w-3.5 accent-crack"
          />
          POST FULLY ANONYMOUS
        </label>
        <p className="font-mono text-[10px] uppercase tracking-wide text-grey">
          HONESTY LOADED: {honestyLoaded}%
        </p>
      </div>

      {error && <p className="mt-2 font-mono text-[10px] uppercase text-crack">{error}</p>}

      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-[10px] text-grey">{text.length}/{MAX_LEN}</span>
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={!text.trim() || submitting}
          data-cursor="CLICK"
          className="border-2 border-ink bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {submitting ? "DROPPING…" : "DROP IT ↓"}
        </button>
      </div>

      {showSafety && (
        <SafetyResourceModal
          onClose={() => (window.location.href = "/safety")}
          onContinue={() => {
            setShowSafety(false);
            submit(true);
          }}
        />
      )}
    </div>
  );
}
