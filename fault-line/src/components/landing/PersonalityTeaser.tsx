"use client";

import Link from "next/link";
import { useState } from "react";
import { DoodleSpeechBubble } from "./Doodles";
import { playSound } from "@/lib/sound";

const QUESTIONS = [
  "When you accidentally wave back at someone who wasn't waving at you, what do you do?",
  "Do you rehearse conversations before they happen?",
  "What's worse: being ignored, or being misunderstood?",
];

export function PersonalityTeaser() {
  const [i, setI] = useState(0);

  return (
    <section className="px-5 md:px-10 py-24 md:py-32 border-t border-ink/15 bg-ink text-paper">
      <div className="mx-auto max-w-[1600px] grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="sys text-xs opacity-60 mb-4">OPTIONAL · TAKES 2 MINUTES</p>
          <h2 className="font-grotesk font-black uppercase text-huge">
            WAIT... THERE ARE
            <br />
            OTHERS LIKE ME?
          </h2>
          <p className="mt-6 max-w-[46ch] opacity-80">
            Answer a few strange, human questions. We&apos;ll quietly match you with Fault Zones and
            people whose patterns look like yours. Your answers are never shown publicly.
          </p>
          <Link
            href="/auth/sign-up"
            className="btn mt-8"
            style={{ background: "#F4F1EA", color: "#111111", borderColor: "#F4F1EA" }}
            onMouseEnter={() => playSound("hover")}
            onClick={() => playSound("click")}
          >
            TAKE THE QUIZ →
          </Link>
        </div>

        <div className="relative">
          <DoodleSpeechBubble className="w-full h-auto text-paper/90" />
          <div className="absolute inset-0 flex items-center justify-center px-10 md:px-16 pb-8">
            <p
              key={i}
              className="text-center text-lg md:text-xl font-medium text-ink animate-floatUp"
            >
              {QUESTIONS[i]}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setI((v) => (v + 1) % QUESTIONS.length);
              playSound("click");
            }}
            className="sys text-[11px] mt-4 mx-auto block opacity-60 hover:opacity-100"
          >
            next question →
          </button>
        </div>
      </div>
    </section>
  );
}
