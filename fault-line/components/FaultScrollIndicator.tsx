"use client";

import { useEffect, useState } from "react";

/**
 * Replaces the native scrollbar affordance with a vertical line on the right
 * edge that fractures more as the visitor moves from top (performance) to
 * bottom (honesty) of the page.
 */
export default function FaultScrollIndicator() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, doc.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const crackAmplitude = progress * 6;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-2 top-0 z-40 hidden h-screen w-6 md:block"
    >
      <svg width="24" height="100%" viewBox="0 0 24 100" preserveAspectRatio="none" className="h-full w-full">
        <line x1="12" y1="0" x2="12" y2="100" stroke="#A6A6A0" strokeWidth="1" />
        <polyline
          points={`12,0 ${12 - crackAmplitude},${25 * progress} ${12 + crackAmplitude},${50 * progress} ${12 - crackAmplitude * 1.4},${75 * progress} 12,${100 * progress}`}
          fill="none"
          stroke="#FF3B30"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
