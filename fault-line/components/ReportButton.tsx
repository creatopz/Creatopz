"use client";

import { useState } from "react";

const REASONS = [
  "SELF-HARM OR DANGER CONCERN",
  "HARASSMENT OR TARGETED ABUSE",
  "HATE SPEECH",
  "SPAM",
  "SOMETHING ELSE",
];

export default function ReportButton({
  contentType,
  contentId,
}: {
  contentType: "post" | "comment" | "user";
  contentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (reason: string) => {
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_type: contentType, content_id: contentId, reason }),
      });
    } finally {
      setSent(true);
      setTimeout(() => setOpen(false), 1600);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Report this content"
        className="font-mono text-[10px] uppercase tracking-wide text-grey hover:text-crack"
      >
        [ REPORT ]
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-56 border-2 border-ink bg-paper p-3 shadow-[4px_4px_0_#111]">
          {sent ? (
            <p className="font-mono text-[10px] uppercase text-ink">
              RECEIVED. A HUMAN WILL REVIEW THIS.
            </p>
          ) : (
            <>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-grey">
                WHY ARE YOU REPORTING THIS?
              </p>
              <ul className="space-y-1">
                {REASONS.map((r) => (
                  <li key={r}>
                    <button
                      type="button"
                      onClick={() => submit(r)}
                      className="w-full text-left font-mono text-[10px] uppercase text-ink hover:text-crack"
                    >
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
