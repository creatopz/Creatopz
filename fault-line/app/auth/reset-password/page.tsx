"use client";

import { useFormState, useFormStatus } from "react-dom";
import AuthShell from "@/components/AuthShell";
import { requestPasswordReset } from "@/app/auth/actions";
import type { AuthResult } from "@/app/auth/actions";

const initial: AuthResult = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full border-2 border-ink bg-ink px-4 py-3 font-mono text-xs uppercase tracking-widest text-paper disabled:opacity-50"
    >
      {pending ? "…" : "SEND RESET LINK →"}
    </button>
  );
}

export default function ResetPasswordPage() {
  const [state, action] = useFormState(requestPasswordReset, initial);
  return (
    <AuthShell eyebrow="[ FORGOT SOMETHING? ]" title="Happens to everyone.">
      <form action={action} className="space-y-3">
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-grey">
            EMAIL
          </span>
          <input
            name="email"
            type="email"
            required
            className="w-full border-2 border-ink bg-transparent px-3 py-2.5 font-grotesk text-base text-ink outline-none focus:bg-white"
          />
        </label>
        {state.error && (
          <p className="font-mono text-[10px] uppercase tracking-wide text-crack">{state.error}</p>
        )}
        <SubmitButton />
      </form>
    </AuthShell>
  );
}
