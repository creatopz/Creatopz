"use client";

import { useEffect, useRef, useState } from "react";
import { PixelFace, type Expression } from "./PixelFace";

const MASKS: { expression: Expression; bg: string; label: string }[] = [
  { expression: "anxious", bg: "#F4F1EA", label: "anxious" },
  { expression: "awkward", bg: "#EAE6DC", label: "awkward" },
  { expression: "crying", bg: "#F4F1EA", label: "crying, but okay" },
  { expression: "angry", bg: "#EAE6DC", label: "angry" },
  { expression: "confused", bg: "#F4F1EA", label: "confused" },
  { expression: "silly", bg: "#EAE6DC", label: "a ridiculous expression" },
  { expression: "blank", bg: "#F4F1EA", label: "completely blank" },
  { expression: "awkward", bg: "#EAE6DC", label: "pretending to be fine" },
];

export function MaskGrid() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [cracked, setCracked] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setCracked(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCracked(true)),
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="fault-thread px-5 md:px-10 py-24 md:py-32 border-t border-ink/15 bg-paper2">
      <div className="mx-auto max-w-[1600px]">
        <h2 className="font-grotesk font-black uppercase text-huge max-w-[16ch]">
          ONLINE, WE WEAR GOOD MASKS.
        </h2>

        <div ref={ref} className="mt-14 grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
          {MASKS.map((m, i) => (
            <div key={i} className="flex flex-col items-center gap-2 group" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="relative border border-ink/30 p-2 md:p-3 bg-paper">
                <div
                  style={{
                    opacity: cracked ? 0 : 1,
                    transform: cracked ? "scale(0.9)" : "scale(1)",
                    transition: `opacity .4s ease ${i * 70}ms, transform .4s ease ${i * 70}ms`,
                    position: cracked ? "absolute" : "static",
                    inset: 0,
                  }}
                >
                  <PixelFace expression="composed" bg={m.bg} />
                </div>
                <div
                  style={{
                    opacity: cracked ? 1 : 0,
                    transform: cracked ? "scale(1)" : "scale(1.08)",
                    transition: `opacity .4s ease ${i * 70 + 120}ms, transform .4s ease ${i * 70 + 120}ms`,
                  }}
                >
                  <PixelFace expression={m.expression} bg={m.bg} />
                </div>
              </div>
              <span className="sys text-[9px] md:text-[10px] text-center opacity-0 group-hover:opacity-60 transition-opacity">
                {m.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <p className="font-grotesk font-black uppercase text-3xl md:text-5xl">Nobody is one version of themselves.</p>
          <p className="font-grotesk font-black uppercase text-3xl md:text-5xl text-red">So why should your profile be?</p>
        </div>
      </div>
    </section>
  );
}
