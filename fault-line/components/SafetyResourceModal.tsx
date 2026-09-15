"use client";

import { SAFETY_RESOURCES } from "@/lib/safety";

export default function SafetyResourceModal({
  onContinue,
  onClose,
}: {
  onContinue: () => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-title"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-6"
    >
      <div className="w-full max-w-md border-2 border-ink bg-paper p-6 shadow-[6px_6px_0_#111]">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">STATUS: WE NOTICED SOMETHING</p>
        <h2 id="safety-title" className="mt-2 font-grotesk text-2xl font-black leading-tight">
          If you&rsquo;re in danger right now, please reach out to someone.
        </h2>
        <p className="mt-3 text-sm text-ink/80">
          You don&rsquo;t have to go through this alone. These lines are free, confidential, and
          staffed by real people.
        </p>
        <ul className="mt-4 space-y-2">
          {SAFETY_RESOURCES.map((r) => (
            <li key={r.name} className="flex items-center justify-between border-b border-ink/20 pb-2 font-mono text-xs">
              <span>
                {r.name} <span className="text-grey">— {r.region}</span>
              </span>
              <span className="font-bold">{r.contact}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-ink bg-ink px-4 py-3 font-mono text-xs uppercase tracking-widest text-paper"
          >
            I need help — take me to resources
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="border-2 border-ink/30 px-4 py-3 font-mono text-xs uppercase tracking-widest text-ink/70 hover:border-ink hover:text-ink"
          >
            I&rsquo;m safe, just post it
          </button>
        </div>
      </div>
    </div>
  );
}
