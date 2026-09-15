"use client";

import { useState } from "react";
import DailyCrackCard from "@/components/DailyCrackCard";
import { AvatarConfig } from "@/lib/types";

export default function DailyCrackFlow({
  prompt,
  username,
  avatarConfig,
}: {
  prompt: string;
  username: string;
  avatarConfig?: AvatarConfig;
}) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className="mt-8">
        <DailyCrackCard prompt={prompt} answer={submitted} username={username} avatarConfig={avatarConfig} />
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-grey">
          Screenshot it. That&rsquo;s the whole feature.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(null)}
          className="mx-auto mt-4 block font-mono text-[10px] uppercase tracking-widest text-ink underline"
        >
          answer differently
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="font-mono text-sm uppercase tracking-wide text-ink/80">{prompt}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value.slice(0, 180))}
        rows={3}
        className="mt-4 w-full border-2 border-ink bg-transparent p-3 font-grotesk text-lg outline-none focus:bg-white"
        placeholder="Keep it short. Cards look better short."
      />
      <button
        type="button"
        disabled={!answer.trim()}
        onClick={() => setSubmitted(answer.trim())}
        className="mt-4 border-2 border-ink bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-paper disabled:opacity-40"
      >
        MAKE MY CARD →
      </button>
    </div>
  );
}
