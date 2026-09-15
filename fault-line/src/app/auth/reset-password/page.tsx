"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { playSound } from "@/lib/sound";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      playSound("error");
      setError(updateError.message);
      return;
    }

    playSound("success");
    setDone(true);
    setTimeout(() => router.push("/feed"), 1200);
  }

  if (done) {
    return (
      <div className="border-2 border-ink p-8 text-center">
        <p className="font-grotesk font-black uppercase text-2xl mb-3">PASSWORD UPDATED.</p>
        <p className="text-sm opacity-70">Taking you back in…</p>
      </div>
    );
  }

  return (
    <div>
      <p className="sys text-xs opacity-60 mb-2">NEW PASSWORD</p>
      <h1 className="font-grotesk font-black uppercase text-3xl md:text-4xl mb-8">SET A NEW ONE.</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <div>
          <label className="field-label" htmlFor="password">
            New password
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
        </div>

        {error && (
          <p role="alert" className="text-sm text-red border border-red/40 bg-red/5 px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn justify-center mt-2 disabled:opacity-50">
          {loading ? "SAVING…" : "SAVE PASSWORD →"}
        </button>
      </form>
    </div>
  );
}
