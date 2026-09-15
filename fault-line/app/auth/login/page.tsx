"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { signInWithPassword, signInWithMagicLink, signInWithGoogle } from "@/app/auth/actions";
import type { AuthResult } from "@/app/auth/actions";

const initial: AuthResult = { error: null };

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full border-2 border-ink bg-ink px-4 py-3 font-mono text-xs uppercase tracking-widest text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-50"
    >
      {pending ? "…" : children}
    </button>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/cracks";
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [passwordState, passwordAction] = useFormState(signInWithPassword, initial);
  const [magicState, magicAction] = useFormState(signInWithMagicLink, initial);

  return (
    <AuthShell
      eyebrow="[ IDENTITY CHECK ]"
      title="Welcome back, human."
      footer={
        <>
          No account?{" "}
          <Link href="/auth/signup" className="text-ink underline">
            Start here
          </Link>
          .
        </>
      }
    >
      {mode === "password" ? (
        <form action={passwordAction} className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <Field name="email" type="email" label="EMAIL" required />
          <Field name="password" type="password" label="PASSWORD" required />
          {passwordState.error && <ErrorText>{passwordState.error}</ErrorText>}
          <SubmitButton>ENTER →</SubmitButton>
          <Link
            href="/auth/reset-password"
            className="block text-center font-mono text-[10px] uppercase tracking-widest text-grey hover:text-ink"
          >
            forgot password?
          </Link>
        </form>
      ) : (
        <form action={magicAction} className="space-y-3">
          <Field name="email" type="email" label="EMAIL" required />
          {magicState.error && <ErrorText>{magicState.error}</ErrorText>}
          <SubmitButton>SEND MAGIC LINK →</SubmitButton>
        </form>
      )}

      <button
        type="button"
        onClick={() => setMode((m) => (m === "password" ? "magic" : "password"))}
        className="mt-4 w-full border-2 border-ink/20 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-ink/70 hover:border-ink hover:text-ink"
      >
        {mode === "password" ? "USE MAGIC LINK INSTEAD" : "USE PASSWORD INSTEAD"}
      </button>

      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="mt-3 w-full border-2 border-ink/20 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-ink/70 hover:border-ink hover:text-ink"
        >
          CONTINUE WITH GOOGLE
        </button>
      </form>
    </AuthShell>
  );
}

function Field({
  name,
  label,
  type,
  required,
}: {
  name: string;
  label: string;
  type: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-grey">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full border-2 border-ink bg-transparent px-3 py-2.5 font-grotesk text-base text-ink outline-none focus:bg-white"
      />
    </label>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10px] uppercase tracking-wide text-crack">{children}</p>;
}
