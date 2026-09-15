"use client";

/**
 * Tiny synthesized sound system. No audio files — every sound is a couple
 * of oscillators shaped with a fast envelope, generated on the fly with the
 * Web Audio API. That keeps the whole thing under a kilobyte and avoids an
 * asset pipeline for something that has to stay this subtle.
 *
 * Respects the user's stored preference (localStorage) and never plays
 * anything before a user gesture, per autoplay policy.
 */

type Kind = "hover" | "click" | "scroll" | "reaction" | "success" | "error";

let ctx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem("fl_sound");
  return stored === "on";
}

export function setSoundEnabled(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("fl_sound", on ? "on" : "off");
}

export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume();
  unlocked = true;
}

function tone(freq: number, duration: number, opts: { type?: OscillatorType; gain?: number; delay?: number; slideTo?: number } = {}) {
  const c = getCtx();
  if (!c || !unlocked || !isSoundEnabled()) return;
  const { type = "sine", gain = 0.05, delay = 0, slideTo } = opts;

  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  const t0 = c.currentTime + delay;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);

  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export function playSound(kind: Kind) {
  switch (kind) {
    case "hover":
      tone(1400, 0.04, { type: "square", gain: 0.02 });
      break;
    case "click":
      tone(220, 0.05, { type: "square", gain: 0.05 });
      tone(880, 0.03, { type: "square", gain: 0.02, delay: 0.02 });
      break;
    case "scroll":
      tone(1800, 0.015, { type: "triangle", gain: 0.015 });
      break;
    case "reaction":
      tone(660, 0.06, { type: "square", gain: 0.04, slideTo: 990 });
      break;
    case "success":
      tone(523, 0.09, { type: "triangle", gain: 0.05 });
      tone(659, 0.09, { type: "triangle", gain: 0.05, delay: 0.09 });
      tone(784, 0.14, { type: "triangle", gain: 0.05, delay: 0.18 });
      break;
    case "error":
      tone(180, 0.12, { type: "sawtooth", gain: 0.035, slideTo: 90 });
      break;
  }
}
