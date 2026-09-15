"use client";

import { useEffect, useRef, useState } from "react";

/** deterministic pseudo-random, so server/client markup never mismatches */
function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

type Block = { x: number; y: number; w: number; h: number; group: string };

const UNIT = 8;

// hand-placed low-res pixel figure on a 12x16 grid, symmetric around x=5.5
const BLOCKS: Block[] = [
  // hair
  { x: 4, y: 0, w: 4, h: 1, group: "hair" },
  { x: 3, y: 1, w: 6, h: 1, group: "hair" },
  // head
  { x: 4, y: 2, w: 4, h: 4, group: "head" },
  // neck
  { x: 5, y: 6, w: 2, h: 1, group: "neck" },
  // torso
  { x: 3, y: 7, w: 6, h: 4, group: "torso" },
  // arms
  { x: 2, y: 7, w: 1, h: 3, group: "armL" },
  { x: 9, y: 7, w: 1, h: 3, group: "armR" },
  // legs
  { x: 4, y: 11, w: 2, h: 5, group: "legL" },
  { x: 6, y: 11, w: 2, h: 5, group: "legR" },
];

const GRID_W = 12 * UNIT;
const GRID_H = 16 * UNIT;

export function PixelHuman({ progress }: { progress: number }) {
  const p = Math.min(1, Math.max(0, progress));

  const crooked = p > 0.45;
  const detach = p > 0.6;
  const crackDash = 1 - Math.min(1, p / 0.5);

  return (
    <svg
      viewBox={`0 0 ${GRID_W} ${GRID_H}`}
      width={GRID_W * 2.4}
      height={GRID_H * 2.4}
      className="pixelated select-none"
      role="img"
      aria-label={crooked ? "A pixel figure, slightly cracked open, showing an honest expression" : "A pixel figure that looks composed"}
    >
      {BLOCKS.map((b, i) => {
        const seed = seeded(i + 1);
        const isOuter = b.group === "armL" || b.group === "armR" || b.group === "hair";
        const driftX = detach && isOuter ? (seed - 0.5) * 14 * ((p - 0.6) / 0.4) : 0;
        const driftY = detach && isOuter ? (seed) * 10 * ((p - 0.6) / 0.4) : 0;
        const rot = detach && isOuter ? (seed - 0.5) * 30 * ((p - 0.6) / 0.4) : 0;
        const opacity = detach && isOuter ? 1 - 0.55 * ((p - 0.6) / 0.4) : 1;

        return (
          <rect
            key={i}
            x={b.x * UNIT}
            y={b.y * UNIT}
            width={b.w * UNIT}
            height={b.h * UNIT}
            fill="#111111"
            style={{
              transform: `translate(${driftX}px, ${driftY}px) rotate(${rot}deg)`,
              transformOrigin: `${(b.x + b.w / 2) * UNIT}px ${(b.y + b.h / 2) * UNIT}px`,
              opacity,
              transition: "transform 0.15s linear, opacity 0.15s linear",
            }}
          />
        );
      })}

      {/* eyes: even + neutral, then one turns red and drops as things crack open */}
      <rect x={4 * UNIT} y={3 * UNIT} width={UNIT} height={UNIT} fill="#F4F1EA" />
      <rect
        x={7 * UNIT}
        y={crooked ? 3.4 * UNIT : 3 * UNIT}
        width={UNIT}
        height={UNIT}
        fill={crooked ? "#FF3B30" : "#F4F1EA"}
        style={{ transition: "y 0.2s ease, fill 0.2s ease" }}
      />

      {/* mouth: flat smile -> crooked line */}
      {!crooked ? (
        <rect x={4.5 * UNIT} y={5 * UNIT} width={3 * UNIT} height={UNIT * 0.35} fill="#F4F1EA" />
      ) : (
        <path
          d={`M ${4.5 * UNIT} ${5.3 * UNIT} L ${6 * UNIT} ${5.8 * UNIT} L ${7.5 * UNIT} ${5.1 * UNIT}`}
          stroke="#F4F1EA"
          strokeWidth={UNIT * 0.35}
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* the fault line itself, drawing through the figure as you scroll */}
      <path
        d={`M ${6 * UNIT} -4 L ${5 * UNIT} ${4 * UNIT} L ${7 * UNIT} ${8 * UNIT} L ${4 * UNIT} ${12 * UNIT} L ${6 * UNIT} ${GRID_H + 4}`}
        stroke="#FF3B30"
        strokeWidth="2"
        fill="none"
        strokeDasharray="1"
        pathLength={1}
        style={{
          strokeDashoffset: crackDash,
          transition: "stroke-dashoffset 0.1s linear",
        }}
      />
    </svg>
  );
}

/**
 * Tracks scroll progress through the hero section (0 at top, 1 once
 * scrolled a full viewport height past it) and feeds it to PixelHuman.
 * Falls back to a fixed, already-cracked pose when reduced motion is on.
 */
export function useHeroScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setProgress(0.7);
      return;
    }

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 while the hero fills the screen, ramps to 1 over the next viewport of scroll
        const scrolled = Math.max(0, -rect.top);
        setProgress(Math.min(1, scrolled / (vh * 0.9)));
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { ref, progress };
}
