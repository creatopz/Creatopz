"use client";

import { useState } from "react";
import { useReveal } from "@/lib/useReveal";
import { TypewriterText } from "./TypewriterText";
import { playSound } from "@/lib/sound";
import { cx } from "@/lib/utils";

type Fragment = {
  lines: string[];
  tag: string;
  handle: string;
  variant: "slide" | "type" | "glitch" | "crack";
  span: string; // tailwind col span / start classes
  accent?: "red" | "blue" | "acid";
};

const FRAGMENTS: Fragment[] = [
  {
    lines: ["I pretend I don't care what people think.", "I care too much."],
    tag: "#insecurity",
    handle: "anonymous_248",
    variant: "slide",
    span: "md:col-span-5",
    accent: "blue",
  },
  {
    lines: ["I rehearse normal conversations", "before they happen."],
    tag: "#awkward",
    handle: "anonymous_071",
    variant: "type",
    span: "md:col-span-4 md:col-start-8",
    accent: "acid",
  },
  {
    lines: ["Everyone thinks I'm confident", "because I'm loud."],
    tag: "#notreally",
    handle: "anonymous_502",
    variant: "glitch",
    span: "md:col-span-4",
    accent: "red",
  },
  {
    lines: ["I still think about something", "embarrassing I did 7 years ago."],
    tag: "#clumsy",
    handle: "anonymous_319",
    variant: "crack",
    span: "md:col-span-5 md:col-start-6",
  },
  {
    lines: ["Sometimes I don't reply because I", "don't know how to be a person that day."],
    tag: "#hidden",
    handle: "anonymous_884",
    variant: "slide",
    span: "md:col-span-6 md:col-start-1",
    accent: "blue",
  },
  {
    lines: ["I say \"I'm fine\" the way other", "people say hello."],
    tag: "#lonely",
    handle: "anonymous_140",
    variant: "type",
    span: "md:col-span-5 md:col-start-8",
    accent: "red",
  },
];

const REACTIONS = [
  { key: "me_too", label: "ME TOO" },
  { key: "felt_that", label: "FELT THAT" },
  { key: "ouch", label: "OUCH" },
  { key: "hug", label: "🫂" },
];

function accentColor(a?: Fragment["accent"]) {
  if (a === "red") return "#FF3B30";
  if (a === "blue") return "#245CFF";
  if (a === "acid") return "#C7FF00";
  return "#111111";
}

function FragmentCard({ f }: { f: Fragment }) {
  const [reacted, setReacted] = useState<string | null>(null);
  const [glitching, setGlitching] = useState(false);

  return (
    <article
      data-reveal
      className={cx(
        "reveal group relative border border-ink/25 bg-paper p-6 md:p-7",
        f.variant === "slide" && "md:translate-x-6",
        f.span
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: accentColor(f.accent) }}
      onMouseEnter={() => {
        if (f.variant === "glitch") {
          setGlitching(true);
          setTimeout(() => setGlitching(false), 220);
        }
      }}
    >
      <p className={cx("text-lg md:text-xl leading-snug", glitching && "animate-glitch")}>
        {f.variant === "type" ? (
          <TypewriterText text={f.lines.join(" ")} />
        ) : (
          f.lines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))
        )}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <span className="sys text-[11px]" style={{ color: accentColor(f.accent) }}>
          {f.tag}
        </span>
        <span className="sys text-[11px] opacity-45">{f.handle}</span>
      </div>

      {/* hover reactions — never "like/comment/share" */}
      <div className="mt-4 flex flex-wrap gap-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 transition-all duration-200">
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => {
              setReacted(r.key);
              playSound("reaction");
            }}
            className={cx(
              "tag-chip hover:bg-ink hover:text-paper transition-colors",
              reacted === r.key && "bg-ink text-paper"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </article>
  );
}

export function LiveConfessions() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section className="fault-thread px-5 md:px-10 py-24 md:py-32 border-t border-ink/15">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-14">
          <h2 className="font-grotesk font-black uppercase text-huge">
            FRAGMENTS OF
            <br />
            PEOPLE, RIGHT NOW.
          </h2>
          <p className="sys text-xs max-w-[30ch] opacity-60">
            THESE ARE REAL SHAPES OF THINGS PEOPLE SAY HERE. NOT ADVICE. JUST HONESTY.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {FRAGMENTS.map((f, i) => (
            <FragmentCard key={i} f={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
