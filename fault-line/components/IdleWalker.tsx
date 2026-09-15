"use client";

import { useEffect, useState } from "react";

/** Easter egg: after 20s of no interaction, a tiny pixel person walks across the bottom of the screen. */
export default function IdleWalker() {
  const [walking, setWalking] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      setWalking(false);
      clearTimeout(timer);
      timer = setTimeout(() => setWalking(true), 20000);
    };
    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, []);

  if (!walking) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-14 left-0 z-30 animate-walk"
      style={{ animationDuration: "6s", animationIterationCount: 1 }}
    >
      <svg width="16" height="16" viewBox="0 0 8 8" shapeRendering="crispEdges">
        <rect width="8" height="8" fill="none" />
        <rect x="3" y="0" width="2" height="2" fill="#111" />
        <rect x="2" y="2" width="4" height="3" fill="#111" />
        <rect x="1" y="5" width="2" height="2" fill="#111" />
        <rect x="5" y="5" width="2" height="2" fill="#111" />
      </svg>
    </div>
  );
}
