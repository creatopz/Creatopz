"use client";

import Link from "next/link";
import { useState } from "react";
import { useSound } from "@/components/providers/SoundProvider";

/**
 * FAULT—LINE wordmark. The two words sit on an intentionally offset
 * baseline with a thin fracture between them. Clicking it repeatedly
 * (easter egg) breaks the alignment further until it gives up and shows
 * "PERFECTION NOT FOUND."
 */
export default function FaultLogo({
  size = "md",
  href = "/",
}: {
  size?: "sm" | "md";
  href?: string | null;
}) {
  const [clicks, setClicks] = useState(0);
  const { play } = useSound();
  const broken = clicks >= 5;
  const offset = Math.min(clicks * 2, 10);

  const content = (
    <span
      className={`inline-flex select-none items-baseline font-grotesk font-black leading-none tracking-tight ${
        size === "sm" ? "text-sm" : "text-lg"
      }`}
      style={{ transform: `translateY(${offset % 2 === 0 ? offset : -offset}px)` }}
    >
      {broken ? (
        <span className="font-mono text-[0.6em] uppercase tracking-widest text-crack">
          PERFECTION NOT FOUND.
        </span>
      ) : (
        <>
          FAULT
          <span aria-hidden className="mx-[1px] inline-block h-[0.7em] w-[2px] -translate-y-[0.05em] bg-crack" />
          LINE
        </>
      )}
    </span>
  );

  const onClick = (e: React.MouseEvent) => {
    if (href === null) return;
    setClicks((c) => c + 1);
    play("click");
    if (clicks + 1 >= 5) e.preventDefault();
  };

  if (href === null) {
    return (
      <button type="button" onClick={onClick} aria-label="FAULT LINE">
        {content}
      </button>
    );
  }

  return (
    <Link href={href} onClick={onClick} aria-label="FAULT LINE — home">
      {content}
    </Link>
  );
}
