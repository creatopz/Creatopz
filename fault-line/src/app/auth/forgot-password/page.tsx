"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { playSound } from "@/lib/sound";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      playSound("error");
      setError(resetError.message);
      return;
    }

    playSound("success");
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border-2 border-ink p-8 text-center">
        <p className="font-grotesk font-black uppercase text-2xl mb-3">LINK SENT.</p>
        <p className="text-sm opacity-70">
          If <span className="font-mono">{email}</span> has an account, a reset link is on its way.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="sys text-xs opacity-60 mb-2">RESET PASSWORD</p>
      <h1 className="font-grotesk font-black uppercase text-3xl md:text-4xl mb-8">EVERYONE FORGETS SOMETHING.</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <div>
          <label className="field-label" htmlFor="email">
            Email
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

        {error && (
          <p role="alert" className="text-sm text-red border border-red/40 bg-red/5 px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn justify-center mt-2 disabled:opacity-50">
          {loading ? "SENDING…" : "SEND RESET LINK →"}
        </button>
      </form>

      <p className="sys text-xs mt-8 opacity-60">
        <Link href="/auth/log-in" className="underline underline-offset-4">
          BACK TO LOG IN
        </Link>
      </p>
    </div>
  );
}
