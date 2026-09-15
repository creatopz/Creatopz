"use client";

import Link from "next/link";
import { useState } from "react";
import { playSound } from "@/lib/sound";
import { cx } from "@/lib/utils";

export function FinalCTA() {
  const [split, setSplit] = useState(false);

  return (
    <section className="relative px-5 md:px-10 py-28 md:py-40 border-t border-ink/15 overflow-hidden">
      <div
        className="mx-auto max-w-[1600px] text-center cursor-pointer select-none"
        role="button"
        tabIndex={0}
        aria-label="Tap to crack the screen"
        onClick={() => {
          setSplit(true);
          playSound("click");
          setTimeout(() => setSplit(false), 550);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setSplit(true);
            playSound("click");
            setTimeout(() => setSplit(false), 550);
          }
        }}
      >
        <p
          className="font-grotesk font-black uppercase text-huge transition-transform duration-300 ease-out"
          style={{ transform: split ? "translate(-6px,-5px)" : "translate(0,0)" }}
        >
          YOUR PERFECT VERSION
          <br />
          ALREADY HAS ENOUGH
          <br />
          PLACES TO LIVE.
        </p>

        {/* the crack */}
        <svg viewBox="0 0 800 24" className="w-full max-w-[1200px] mx-auto my-6 md:my-8 h-4" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0 12 L60 12 L90 2 L120 20 L160 6 L210 18 L260 10 L320 15 L380 4 L440 19 L500 9 L560 16 L620 6 L680 14 L740 11 L800 12"
            stroke="#FF3B30"
            strokeWidth="2"
            fill="none"
            style={{ transition: "transform 0.3s ease", transform: split ? "scaleY(1.8)" : "scaleY(1)", transformOrigin: "center" }}
          />
        </svg>

        <p
          className="font-grotesk font-black uppercase text-huge text-red transition-transform duration-300 ease-out"
          style={{ transform: split ? "translate(6px,5px)" : "translate(0,0)" }}
        >
          LET THE OTHER ONE OUT.
        </p>
      </div>

      <div className="mt-14 flex flex-col items-center gap-4">
        <Link
          href="/auth/sign-up"
          className="btn text-base px-8 py-4"
          onMouseEnter={() => playSound("hover")}
          onClick={() => playSound("click")}
        >
          ENTER FAULT LINE →
        </Link>
        <div className="sys text-[11px] opacity-60 text-center space-y-1">
          <p>NO REAL NAME REQUIRED.</p>
          <p>NO PERFECT PHOTO REQUIRED.</p>
          <p className={cx("text-ink font-semibold")}>JUST BE HUMAN.</p>
        </div>
      </div>
    </section>
  );
}
