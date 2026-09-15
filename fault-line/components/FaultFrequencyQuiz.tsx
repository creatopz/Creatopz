"use client";

import { useState } from "react";
import Link from "next/link";
import { FAULT_FREQUENCY_QUESTIONS, faultFrequencySignature, SIGNATURE_LABELS } from "@/lib/faultFrequency";
import { Community } from "@/lib/types";
import CommunityCard from "@/components/CommunityCard";

type Phase = "quiz" | "analyzing" | "result";

export default function FaultFrequencyQuiz({ isAuthed }: { isAuthed: boolean }) {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [matches, setMatches] = useState<Community[]>([]);
  const q = FAULT_FREQUENCY_QUESTIONS[step];

  const answer = async (key: string) => {
    const next = { ...answers, [q.id]: key };
    setAnswers(next);
    if (step < FAULT_FREQUENCY_QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }
    setPhase("analyzing");

    if (isAuthed) {
      fetch("/api/fault-frequency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: next }),
      }).catch(() => {});
    }

    const signature = faultFrequencySignature(next);
    const res = await fetch(`/api/communities/match?signature=${signature}`);
    const data = await res.json();

    setTimeout(() => {
      setMatches(data.communities ?? []);
      setPhase("result");
    }, 1400);
  };

  if (phase === "analyzing") {
    return (
      <div className="py-20 text-center">
        <p className="animate-pulse font-mono text-sm uppercase tracking-widest text-crack">
          ANALYSING YOUR CHAOS…
        </p>
      </div>
    );
  }

  if (phase === "result") {
    const signature = faultFrequencySignature(answers);
    return (
      <div className="py-10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">WE FOUND YOUR PEOPLE.</p>
        <h2 className="mt-2 font-grotesk text-3xl font-black">
          You&rsquo;re {SIGNATURE_LABELS[signature] ?? "SOMETHING UNCLASSIFIABLE"}.
        </h2>
        <p className="mt-2 text-sm text-ink/70">Here&rsquo;s where your kind of weird hangs out.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {matches.map((c) => (
            <CommunityCard key={c.id} community={c} isAuthed={isAuthed} />
          ))}
        </div>
        {!isAuthed && (
          <Link
            href="/auth/signup"
            className="mt-8 inline-block border-2 border-ink bg-ink px-5 py-3 font-mono text-xs uppercase tracking-widest text-paper"
          >
            JOIN TO SAVE YOUR RESULT →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="py-10">
      <p className="font-mono text-[10px] uppercase tracking-widest text-grey">
        QUESTION {step + 1} / {FAULT_FREQUENCY_QUESTIONS.length}
      </p>
      <h2 className="mt-3 font-grotesk text-2xl font-black">{q.prompt}</h2>
      <div className="mt-6 space-y-3">
        {q.options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => answer(o.key)}
            className="block w-full border-2 border-ink p-4 text-left font-mono text-sm hover:bg-ink hover:text-paper"
          >
            {o.key}. {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
