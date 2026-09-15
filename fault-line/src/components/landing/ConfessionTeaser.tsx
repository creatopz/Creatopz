"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { playSound } from "@/lib/sound";

/**
 * Nothing typed here is ever sent anywhere or stored — this is a purely
 * client-side emotional beat, not a form. See the "never post it" premise
 * in the copy below: it would be dishonest to actually save it.
 */
export function ConfessionTeaser() {
  const [text, setText] = useState("");
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (text.trim().length > 6 && !revealed) {
      timer.current = setTimeout(() => {
        setRevealed(true);
        playSound("success");
      }, 1500);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const intensity = Math.min(1, text.length / 90);

  return (
    <section id="confess" className="fault-thread relative px-5 md:px-10 py-24 md:py-32">
      <div className="mx-auto max-w-[900px]">
        <p className="sys text-xs opacity-60 mb-4">TRY IT — NOTHING YOU TYPE HERE IS SAVED</p>

        <div className="relative border-[1.5px] border-ink bg-paper">
          <textarea
            aria-label="Something you would never post on Instagram"
            value={text}
            disabled={revealed}
            onChange={(e) => setText(e.target.value.slice(0, 240))}
            placeholder="something you would never post on instagram..."
            rows={3}
            className="w-full resize-none bg-transparent p-6 md:p-8 text-xl md:text-2xl outline-none placeholder:text-ink/35"
            style={{
              letterSpacing: `${intensity * 0.06}em`,
              filter: revealed ? "blur(3px)" : `blur(${intensity * 0.6}px)`,
              opacity: revealed ? 0.25 : 1,
              transition: "filter 0.4s ease, opacity 0.6s ease",
            }}
          />

          {/* redaction bar sweeps in once revealed, covering what was typed */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 bg-ink flex items-center overflow-hidden"
            style={{
              width: revealed ? "100%" : "0%",
              transition: "width 0.7s cubic-bezier(.7,0,.3,1)",
            }}
          >
            <span className="px-font text-paper text-[10px] md:text-xs whitespace-nowrap px-8">
              FAULT LINE · FAULT LINE · FAULT LINE · FAULT LINE · FAULT LINE
            </span>
          </div>
        </div>

        <div
          className="mt-8 overflow-hidden transition-[max-height,opacity] duration-700 ease-out"
          style={{ maxHeight: revealed ? 200 : 0, opacity: revealed ? 1 : 0 }}
        >
          <p className="font-grotesk font-black uppercase text-2xl md:text-4xl leading-tight">
            YOU DON&apos;T HAVE TO POST IT HERE YET.
          </p>
          <p className="font-grotesk font-black uppercase text-2xl md:text-4xl leading-tight text-red mt-1">
            BUT SOMEONE ELSE ALREADY HAS.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/auth/sign-up"
              className="btn"
              onMouseEnter={() => playSound("hover")}
              onClick={() => playSound("click")}
            >
              ENTER THE FAULT LINE →
            </Link>
            <button
              type="button"
              className="sys text-xs underline underline-offset-4 opacity-60 hover:opacity-100"
              onClick={() => {
                setText("");
                setRevealed(false);
              }}
            >
              try another
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
