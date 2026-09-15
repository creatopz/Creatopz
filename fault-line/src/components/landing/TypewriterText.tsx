"use client";

import { useEffect, useRef, useState } from "react";

export function TypewriterText({ text, className, speed = 22 }: { text: string; className?: string; speed?: number }) {
  const [shown, setShown] = useState("");
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(text);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            let i = 0;
            const id = setInterval(() => {
              i += 1;
              setShown(text.slice(0, i));
              if (i >= text.length) clearInterval(id);
            }, speed);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, speed]);

  return (
    <span ref={ref} className={className}>
      {shown}
      <span className="inline-block w-[0.5ch] animate-blink">{shown.length < text.length ? "▌" : ""}</span>
    </span>
  );
}
