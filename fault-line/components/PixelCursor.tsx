"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom pixel cursor. Desktop (hover+fine-pointer) only — mobile gets native
 * tap feedback instead. Respects prefers-reduced-motion by disabling entirely.
 */
export default function PixelCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduceMotion || !fine) return;

    setActive(true);
    document.body.classList.add("fl-cursor-active");

    let raf = 0;
    const move = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (dotRef.current) {
          dotRef.current.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
        }
        const target = e.target as HTMLElement | null;
        const zone = target?.closest("[data-cursor]") as HTMLElement | null;
        setLabel(zone?.dataset.cursor ?? null);
      });
    };

    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      document.body.classList.remove("fl-cursor-active");
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!active) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center"
      style={{ willChange: "transform" }}
    >
      {label ? (
        <span className="whitespace-nowrap border-2 border-ink bg-acid px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">
          {label}
        </span>
      ) : (
        <span className="block h-3 w-3 bg-ink" />
      )}
    </div>
  );
}
