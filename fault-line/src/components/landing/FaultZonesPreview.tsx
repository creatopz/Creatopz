"use client";

import Link from "next/link";
import { useReveal } from "@/lib/useReveal";
import { cx } from "@/lib/utils";

const ZONES = [
  { name: "THE OVERTHINKERS", desc: "12,482 people currently overthinking.", accent: "blue" as const },
  { name: "SOCIALLY AWKWARD", desc: "Nobody knows how to start the conversation.", accent: "acid" as const },
  { name: "FORMER PEOPLE-PLEASERS", desc: "Recovering from saying \"it's fine.\"", accent: "red" as const },
  { name: "THE 3AM CLUB", desc: "Thoughts that arrive when everyone else is sleeping.", accent: "blue" as const },
  { name: "CLUMSY HUMANS", desc: "Tripped over nothing. Twice. In public.", accent: "acid" as const },
  { name: "PRETENDING I'M FINE", desc: "You're not the only one.", accent: "red" as const },
];

const ACCENT = { red: "#FF3B30", blue: "#245CFF", acid: "#C7FF00" };

export function FaultZonesPreview() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="fault-zones" className="fault-thread px-5 md:px-10 py-24 md:py-32 border-t border-ink/15">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-14">
          <h2 className="font-grotesk font-black uppercase text-huge max-w-[20ch]">FAULT ZONES.</h2>
          <p className="sys text-xs max-w-[32ch] opacity-60">
            ANONYMOUS COMMUNITIES BUILT AROUND WHAT YOU FEEL, NOT WHAT YOU SHOW.
          </p>
        </div>

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {ZONES.map((z, i) => (
            <div
              key={z.name}
              data-reveal
              className="reveal relative p-6 border border-ink bg-paper hover:-translate-y-1 hover:shadow-[4px_4px_0_#111] transition-transform"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="w-3 h-3 mb-4" style={{ background: ACCENT[z.accent] }} />
              <h3 className="font-grotesk font-black uppercase text-lg mb-2">{z.name}</h3>
              <p className="sys text-[11px] opacity-70">{z.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/zones" className={cx("btn btn-outline")}>
            SEE ALL FAULT ZONES →
          </Link>
        </div>
      </div>
    </section>
  );
}
