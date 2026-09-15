"use client";

import { useSound } from "@/components/providers/SoundProvider";

export default function SoundToggle() {
  const { enabled, toggle, play } = useSound();

  return (
    <button
      type="button"
      onClick={() => {
        toggle();
        // play after toggling on, so turning it on gives instant feedback
        setTimeout(() => play("blip"), 30);
      }}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn sound off" : "Turn sound on"}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 border-2 border-ink bg-paper px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink shadow-[3px_3px_0_#111] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111] focus-visible:-translate-y-0.5"
    >
      <span
        aria-hidden
        className={`inline-block h-2 w-2 ${enabled ? "bg-crack" : "bg-grey"}`}
      />
      SOUND: {enabled ? "ON" : "OFF"}
    </button>
  );
}
