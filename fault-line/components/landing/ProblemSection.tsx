"use client";

import { motion } from "framer-motion";

const TILES = [
  { label: "PERFECT VACATION", hidden: "I actually hate how I look in every photo." },
  { label: "PERFECT BODY", hidden: "I have no idea what I'm doing." },
  { label: "PERFECT RELATIONSHIP", hidden: "I'm jealous of my friends, constantly." },
  { label: "PERFECT SUCCESS", hidden: "I pretend I'm confident. I'm not." },
  { label: "PERFECT ROUTINE", hidden: "I'm scared I'll fail and everyone will see." },
  { label: "PERFECT FRIEND GROUP", hidden: "I feel lonely even around people." },
];

export default function ProblemSection() {
  return (
    <section className="border-y-2 border-ink bg-paper px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">[ THE PROBLEM ]</p>
        <h2 className="mt-3 font-grotesk text-huge font-black uppercase leading-[0.9]">
          The internet has
          <br />a perfection problem.
        </h2>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile, i) => (
            <motion.div
              key={tile.label}
              initial={{ rotate: 0 }}
              whileInView={{ rotate: [0, -1.5, 1.5, 0] }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative aspect-square overflow-hidden border-2 border-ink bg-ink"
            >
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center font-mono text-[10px] uppercase tracking-widest text-paper/70 transition-opacity duration-500 group-hover:opacity-0">
                {tile.label}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-crack p-4 text-center font-grotesk text-sm font-bold text-paper opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                &ldquo;{tile.hidden}&rdquo;
              </div>
              {/* crack overlay */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M50 0 L45 30 L58 45 L48 70 L52 100" stroke="#F1EFE8" strokeWidth="1" fill="none" />
              </svg>
            </motion.div>
          ))}
        </div>
        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-widest text-grey">
          hover a tile
        </p>
      </div>
    </section>
  );
}
