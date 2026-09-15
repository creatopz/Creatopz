"use client";

import { useFormState, useFormStatus } from "react-dom";
import AuthShell from "@/components/AuthShell";
import { updatePassword } from "@/app/auth/actions";
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
      {pending ? "…" : "SET NEW PASSWORD →"}
    </button>
  );
}

export default function UpdatePasswordPage() {
  const [state, action] = useFormState(updatePassword, initial);
  return (
    <AuthShell eyebrow="[ RESET IN PROGRESS ]" title="Pick a new password.">
      <form action={action} className="space-y-3">
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-grey">
            NEW PASSWORD (8+ CHARACTERS)
          </span>
          <input
            name="password"
            type="password"
            minLength={8}
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
