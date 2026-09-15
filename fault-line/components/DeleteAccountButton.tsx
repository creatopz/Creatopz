"use client";

import { useState } from "react";
import type { AuthResult } from "@/app/auth/actions";

export default function DeleteAccountButton({
  action,
}: {
  action: () => Promise<AuthResult>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-4 border-2 border-crack px-4 py-3 font-mono text-xs uppercase tracking-widest text-crack hover:bg-crack hover:text-paper"
      >
        DELETE MY ACCOUNT
      </button>
    );
  }

  return (
    <div className="mt-4 border-2 border-crack p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-crack">ARE YOU SURE?</p>
      {error && <p className="mt-2 font-mono text-[10px] text-crack">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            const res = await action();
            if (res?.error) {
              setError(res.error);
              setPending(false);
            }
          }}
          className="flex-1 border-2 border-crack bg-crack px-4 py-3 font-mono text-xs uppercase tracking-widest text-paper disabled:opacity-50"
        >
          {pending ? "…" : "YES, DELETE EVERYTHING"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="flex-1 border-2 border-ink/30 px-4 py-3 font-mono text-xs uppercase tracking-widest text-ink/70"
        >
          NEVERMIND
        </button>
      </div>
    </div>
  );
}
