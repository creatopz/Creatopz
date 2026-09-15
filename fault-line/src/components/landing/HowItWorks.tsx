"use client";

import { useReveal } from "@/lib/useReveal";

const STEPS = [
  {
    n: "01",
    title: "CREATE YOUR MASK",
    body: "Build your pixel identity. No followers. No perfect photos. No pressure.",
  },
  {
    n: "02",
    title: "FIND YOUR FAULT",
    body: "Choose what you feel but rarely say. Insecurity. Fear. Jealousy. Failure. Awkwardness. Anything.",
  },
  {
    n: "03",
    title: "LET IT OUT",
    body: "Write it. Post it anonymously. No real identity attached to the post.",
  },
  {
    n: "04",
    title: "FIND PEOPLE WHO GET IT",
    body: "Discover people who think, feel or struggle similarly. Not because you're perfect together — because you're honest.",
  },
];

export function HowItWorks() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="how-it-works" className="px-5 md:px-10 py-24 md:py-32 border-t border-ink/15">
      <div className="mx-auto max-w-[1600px]">
        <h2 className="sys text-xs opacity-60 mb-3">HOW FAULT LINE WORKS</h2>
        <div className="rule mb-12" />

        <div ref={ref} className="grid md:grid-cols-4 gap-0">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              data-reveal
              className="reveal relative border-t-2 border-ink pt-6 md:pr-8 md:border-l md:border-t-2"
              style={{ borderLeftWidth: i === 0 ? 0 : 1, borderLeftColor: "rgba(17,17,17,0.15)", transitionDelay: `${i * 90}ms` }}
            >
              <span className="font-mono text-sm opacity-50">{s.n}</span>
              <h3 className="font-grotesk font-black uppercase text-xl md:text-2xl mt-3 mb-3">{s.title}</h3>
              <p className="text-sm opacity-80 max-w-[32ch]">{s.body}</p>
              {i < STEPS.length - 1 && (
                <span className="hidden md:block absolute -right-[9px] top-6 text-lg text-red" aria-hidden="true">
                  ↓
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
