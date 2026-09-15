"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { playSound } from "@/lib/sound";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentConfirmation, setSentConfirmation] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    });

    setLoading(false);

    if (signUpError) {
      playSound("error");
      setError(signUpError.message);
      return;
    }

    playSound("success");

    // if email confirmation is off in the Supabase project, we already have
    // a session and can go straight into onboarding
    if (data.session) {
      router.push("/onboarding");
    } else {
      setSentConfirmation(true);
    }
  }

  if (sentConfirmation) {
    return (
      <div className="border-2 border-ink p-8 text-center">
        <p className="font-grotesk font-black uppercase text-2xl mb-3">CHECK YOUR INBOX.</p>
        <p className="text-sm opacity-70">
          We sent a confirmation link to <span className="font-mono">{email}</span>. Your email is
          private — it will never appear anywhere on your public profile.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="sys text-xs opacity-60 mb-2">CREATE ACCOUNT</p>
      <h1 className="font-grotesk font-black uppercase text-3xl md:text-4xl mb-8">
        WHO ARE YOU
        <br />
        WHEN NOBODY&apos;S WATCHING?
      </h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <div>
          <label className="field-label" htmlFor="email">
            Email (private — never shown publicly)
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-[11px] opacity-50 mt-1">At least 8 characters.</p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red border border-red/40 bg-red/5 px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn justify-center mt-2 disabled:opacity-50" onClick={() => playSound("click")}>
          {loading ? "CREATING…" : "CREATE ACCOUNT →"}
        </button>
      </form>

      <p className="sys text-xs mt-8 opacity-60">
        ALREADY HERE?{" "}
        <Link href="/auth/log-in" className="underline underline-offset-4">
          LOG IN
        </Link>
      </p>
    </div>
  );
}
