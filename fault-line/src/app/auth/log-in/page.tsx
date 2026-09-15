"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { playSound } from "@/lib/sound";

function LogInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/feed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      playSound("error");
      setError(signInError.message);
      return;
    }

    playSound("success");
    router.push(next);
    router.refresh();
  }

  return (
    <div>
      <p className="sys text-xs opacity-60 mb-2">LOG IN</p>
      <h1 className="font-grotesk font-black uppercase text-3xl md:text-4xl mb-8">WELCOME BACK TO THE CRACK.</h1>

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

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="field-label mb-0" htmlFor="password">
              Password
            </label>
            <Link href="/auth/forgot-password" className="sys text-[10px] opacity-60 hover:opacity-100">
              forgot?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red border border-red/40 bg-red/5 px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn justify-center mt-2 disabled:opacity-50" onClick={() => playSound("click")}>
          {loading ? "LOGGING IN…" : "LOG IN →"}
        </button>
      </form>

      <p className="sys text-xs mt-8 opacity-60">
        NEW HERE?{" "}
        <Link href="/auth/sign-up" className="underline underline-offset-4">
          CREATE ACCOUNT
        </Link>
      </p>
    </div>
  );
}

export default function LogInPage() {
  return (
    <Suspense fallback={null}>
      <LogInForm />
    </Suspense>
  );
}
