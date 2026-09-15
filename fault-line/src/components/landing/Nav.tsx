"use client";

import Link from "next/link";
import { useState } from "react";
import { Wordmark } from "./Wordmark";
import { SoundToggle } from "./SoundToggle";
import { playSound } from "@/lib/sound";

const LINKS = [
  { href: "/#confess", label: "EXPLORE" },
  { href: "/#how-it-works", label: "HOW IT WORKS" },
  { href: "/#fault-zones", label: "FAULT ZONES" },
  { href: "/#pricing", label: "PRICING" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-ink/15 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="hover:opacity-70 transition-opacity"
          onMouseEnter={() => playSound("hover")}
          onClick={() => playSound("click")}
        >
          <Wordmark size="text-lg md:text-xl" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="sys text-[12px] hover:text-red transition-colors"
              onMouseEnter={() => playSound("hover")}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <SoundToggle />
          <Link href="/auth/log-in" className="btn" onMouseEnter={() => playSound("hover")} onClick={() => playSound("click")}>
            ENTER →
          </Link>
        </div>

        {/* mobile: pixel crack icon expands into nav */}
        <button
          type="button"
          className="md:hidden relative w-9 h-9 grid place-items-center"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => {
            playSound("click");
            setOpen((o) => !o);
          }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" shapeRendering="crispEdges">
            <rect x="10" y="2" width="4" height="4" fill="#111" />
            <rect x={open ? "2" : "6"} y="10" width="4" height="4" fill="#111" style={{ transition: "x .18s" }} />
            <rect x="10" y="10" width="4" height="4" fill="#FF3B30" />
            <rect x={open ? "18" : "14"} y="10" width="4" height="4" fill="#111" style={{ transition: "x .18s" }} />
            <rect x="10" y="18" width="4" height="4" fill="#111" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink/15 bg-paper px-5 py-6 flex flex-col gap-5 animate-floatUp">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="sys text-sm" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="rule" />
          <div className="flex items-center justify-between">
            <SoundToggle />
            <Link href="/auth/log-in" className="btn" onClick={() => setOpen(false)}>
              ENTER →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
