"use client";

import { useEffect, useState } from "react";
import { isSoundEnabled, setSoundEnabled, unlockAudio, playSound } from "@/lib/sound";

export function SoundToggle() {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOn(isSoundEnabled());
    setReady(true);
  }, []);

  if (!ready) return <div className="w-[92px] h-[30px]" aria-hidden="true" />;

  return (
    <button
      type="button"
      onClick={() => {
        unlockAudio();
        const next = !on;
        setSoundEnabled(next);
        setOn(next);
        if (next) playSound("success");
      }}
      className="sys flex items-center gap-2 border border-ink px-3 py-[6px] text-[11px] hover:bg-ink hover:text-paper transition-colors"
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
    >
      <span style={{ color: on ? "#245CFF" : undefined }}>{on ? "●" : "○"}</span>
      SOUND: {on ? "ON" : "OFF"}
    </button>
  );
}
