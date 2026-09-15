"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { signUpWithPassword } from "@/app/auth/actions";
import type { AuthResult } from "@/app/auth/actions";

const initial: AuthResult = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full border-2 border-ink bg-ink px-4 py-3 font-mono text-xs uppercase tracking-widest text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-50"
    >
      {pending ? "…" : "CREATE ACCOUNT →"}
    </button>
  );
}

export default function SignupPage() {
  const [state, action] = useFormState(signUpWithPassword, initial);

  return (
    <AuthShell
      eyebrow="[ NEW HUMAN ]"
      title="You don't have to look okay here."
      footer={
        <>
          Already in?{" "}
          <Link href="/auth/login" className="text-ink underline">
            Enter
          </Link>
          . By signing up you agree not to use FAULT LINE to target or harass
          anyone — this is a place for honesty about yourself, not weapons
          against others.
        </>
      }
    >
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
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-grey">
            PASSWORD (8+ CHARACTERS)
          </span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border-2 border-ink bg-transparent px-3 py-2.5 font-grotesk text-base text-ink outline-none focus:bg-white"
          />
        </label>
        {state.error && (
          <p className="font-mono text-[10px] uppercase tracking-wide text-crack">{state.error}</p>
        )}
        <SubmitButton />
      </form>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-grey">
        NO PERFECT PHOTOS REQUIRED
      </p>
    </AuthShell>
  );
}
