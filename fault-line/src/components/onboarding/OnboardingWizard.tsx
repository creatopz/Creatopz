"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AvatarBuilder } from "@/components/avatar/AvatarBuilder";
import { AvatarRenderer } from "@/components/avatar/AvatarRenderer";
import { DEFAULT_AVATAR_CONFIG, type Expression } from "@/lib/avatar";
import { generateAnonymousUsername, cx } from "@/lib/utils";
import { playSound } from "@/lib/sound";
import type { AvatarConfig } from "@/types/database";

type Question = { id: string; prompt: string; order_index: number };
type Zone = { id: string; slug: string; name: string; description: string; theme: string };

const STEP_LABELS = ["USERNAME", "YOUR MASK", "FIND YOUR PATTERN", "FAULT ZONES", "ENTER"];

export function OnboardingWizard({
  userId,
  questions,
  zones,
}: {
  userId: string;
  questions: Question[];
  zones: Zone[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(generateAnonymousUsername());
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG);
  const [expression, setExpression] = useState<Expression>("neutral");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const valid = /^[a-z0-9_]{3,24}$/i.test(username);
    if (!valid) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("id").eq("anonymous_username", username).maybeSingle();
      setUsernameStatus(data ? "taken" : "available");
    }, 450);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  function next() {
    playSound("click");
    setStep((s) => Math.min(STEP_LABELS.length - 1, s + 1));
  }
  function back() {
    playSound("click");
    setStep((s) => Math.max(0, s - 1));
  }

  async function finish() {
    setSubmitting(true);
    setError(null);

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      anonymous_username: username,
      avatar_config: avatarConfig,
      avatar_expression: expression,
    });

    if (profileError) {
      setSubmitting(false);
      setError(profileError.message);
      playSound("error");
      return;
    }

    const answerRows = Object.entries(answers)
      .filter(([, v]) => v.trim().length > 0)
      .map(([question_id, answer]) => ({ user_id: userId, question_id, answer: answer.trim() }));
    if (answerRows.length > 0) {
      await supabase.from("personality_answers").insert(answerRows);
    }

    if (selectedZones.length > 0) {
      await supabase.from("zone_members").insert(selectedZones.map((zone_id) => ({ zone_id, user_id: userId })));
    }

    playSound("success");
    router.push("/feed");
    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-1 mb-10" aria-hidden="true">
        {STEP_LABELS.map((_, i) => (
          <div key={i} className={cx("h-1 flex-1", i <= step ? "bg-ink" : "bg-ink/15")} />
        ))}
      </div>
      <p className="sys text-xs opacity-50 mb-3">
        STEP {step + 1} / {STEP_LABELS.length} — {STEP_LABELS[step]}
      </p>

      {step === 0 && (
        <div>
          <h1 className="font-grotesk font-black uppercase text-3xl md:text-4xl mb-3">
            WHO ARE YOU
            <br />
            WHEN NOBODY&apos;S WATCHING?
          </h1>
          <p className="opacity-70 mb-8 max-w-[52ch]">
            Pick an anonymous username. It&apos;s the only name anyone here will ever know you by.
          </p>

          <label className="field-label" htmlFor="username">
            Anonymous username
          </label>
          <div className="flex gap-3">
            <input
              id="username"
              className="field"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              maxLength={24}
            />
            <button
              type="button"
              className="btn btn-outline whitespace-nowrap"
              onClick={() => setUsername(generateAnonymousUsername())}
            >
              REROLL
            </button>
          </div>
          <p className="text-[11px] mt-2 h-4" role="status">
            {usernameStatus === "checking" && "checking…"}
            {usernameStatus === "available" && <span style={{ color: "#245CFF" }}>available</span>}
            {usernameStatus === "taken" && <span className="text-red">someone else already is</span>}
            {usernameStatus === "invalid" && "3–24 letters, numbers or underscores"}
          </p>

          <button
            type="button"
            disabled={usernameStatus !== "available"}
            className="btn mt-8 disabled:opacity-40"
            onClick={next}
          >
            CONTINUE →
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h1 className="font-grotesk font-black uppercase text-3xl md:text-4xl mb-3">BUILD YOUR MASK.</h1>
          <p className="opacity-70 mb-8 max-w-[52ch]">
            No real photo needed. Make something that feels like you — or the version of you nobody sees yet.
          </p>
          <AvatarBuilder
            config={avatarConfig}
            expression={expression}
            onChange={setAvatarConfig}
            onExpressionChange={setExpression}
          />
          <div className="flex gap-3 mt-10">
            <button type="button" className="btn btn-outline" onClick={back}>
              ← BACK
            </button>
            <button type="button" className="btn" onClick={next}>
              CONTINUE →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="font-grotesk font-black uppercase text-3xl md:text-4xl mb-3">FIND YOUR PATTERN.</h1>
          <p className="opacity-70 mb-8 max-w-[52ch]">
            Optional. Answer as many as you want — skip the rest. Nobody sees these but you.
          </p>
          <div className="flex flex-col gap-6">
            {questions.map((q) => (
              <div key={q.id}>
                <label className="field-label" htmlFor={q.id}>
                  {q.prompt}
                </label>
                <textarea
                  id={q.id}
                  rows={2}
                  className="field resize-none"
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                />
              </div>
            ))}
            {questions.length === 0 && <p className="opacity-50 text-sm">No questions configured yet — skip ahead.</p>}
          </div>
          <div className="flex gap-3 mt-10">
            <button type="button" className="btn btn-outline" onClick={back}>
              ← BACK
            </button>
            <button type="button" className="btn" onClick={next}>
              CONTINUE →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="font-grotesk font-black uppercase text-3xl md:text-4xl mb-3">PICK A FEW FAULT ZONES.</h1>
          <p className="opacity-70 mb-8 max-w-[52ch]">You can join or leave any of these later.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {zones.map((z) => {
              const active = selectedZones.includes(z.id);
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setSelectedZones((s) => (active ? s.filter((id) => id !== z.id) : [...s, z.id]));
                  }}
                  className={cx(
                    "text-left border border-ink p-4 transition-colors",
                    active ? "bg-ink text-paper" : "bg-paper hover:bg-paper2"
                  )}
                >
                  <p className="font-grotesk font-black uppercase text-sm">{z.name}</p>
                  <p className="sys text-[10px] opacity-70 mt-1">{z.description}</p>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 mt-10">
            <button type="button" className="btn btn-outline" onClick={back}>
              ← BACK
            </button>
            <button type="button" className="btn" onClick={next}>
              CONTINUE →
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h1 className="font-grotesk font-black uppercase text-3xl md:text-4xl mb-3">THAT&apos;S YOU.</h1>
          <div className="flex items-center gap-4 border border-ink p-5 mb-8 w-fit">
            <AvatarRenderer config={avatarConfig} expression={expression} size={72} />
            <div>
              <p className="font-mono text-sm">{username}</p>
              <p className="sys text-[10px] opacity-50">{selectedZones.length} FAULT ZONE{selectedZones.length === 1 ? "" : "S"} JOINED</p>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red border border-red/40 bg-red/5 px-3 py-2 mb-6">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button type="button" className="btn btn-outline" onClick={back} disabled={submitting}>
              ← BACK
            </button>
            <button type="button" className="btn disabled:opacity-50" onClick={finish} disabled={submitting}>
              {submitting ? "ENTERING…" : "ENTER FAULT LINE →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
