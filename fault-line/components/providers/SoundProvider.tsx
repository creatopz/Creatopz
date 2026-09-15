"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SoundName = "click" | "pop" | "flip" | "blip" | "tick";

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
  play: (name: SoundName) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

// Tiny synthesized retro blips via WebAudio — no external audio files needed,
// so the platform stays dependency-free and each sound is instant + tiny.
function synth(ctx: AudioContext, name: SoundName) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const presets: Record<SoundName, { type: OscillatorType; freq: number; dur: number }> = {
    click: { type: "square", freq: 620, dur: 0.035 },
    pop: { type: "square", freq: 340, dur: 0.06 },
    flip: { type: "triangle", freq: 220, dur: 0.09 },
    blip: { type: "square", freq: 880, dur: 0.05 },
    tick: { type: "square", freq: 1040, dur: 0.02 },
  };
  const p = presets[name];
  osc.type = p.type;
  osc.frequency.setValueAtTime(p.freq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(p.freq * 0.6, 40), now + p.dur);
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + p.dur);
  osc.start(now);
  osc.stop(now + p.dur + 0.02);
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("fl_sound") : null;
    if (stored === "on") setEnabled(true);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem("fl_sound", next ? "on" : "off");
      } catch {
        /* private mode — ignore */
      }
      return next;
    });
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      if (!enabled) return;
      try {
        if (!ctxRef.current) {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          ctxRef.current = new AudioCtx();
        }
        if (ctxRef.current.state === "suspended") ctxRef.current.resume();
        synth(ctxRef.current, name);
      } catch {
        /* audio unsupported — silently no-op, sound is always optional */
      }
    },
    [enabled]
  );

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}
