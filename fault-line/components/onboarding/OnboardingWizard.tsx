"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AvatarBuilder from "@/components/onboarding/AvatarBuilder";
import { AvatarConfig, DEFAULT_AVATAR, PRIVACY_LEVELS, VIBE_TAGS } from "@/lib/types";
import { FAULT_FREQUENCY_QUESTIONS } from "@/lib/faultFrequency";
import { useSound } from "@/components/providers/SoundProvider";

const STEPS = ["USERNAME", "BUILD YOUR HUMAN", "VIBE", "PRIVACY", "FAULT FREQUENCY", "DONE"] as const;

export default function OnboardingWizard({ initialUsername }: { initialUsername: string }) {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(initialUsername);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [mood, setMood] = useState(":|");
  const [vibeTags, setVibeTags] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<(typeof PRIVACY_LEVELS)[number]["key"]>("pseudonymous");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { play } = useSound();
  const router = useRouter();

  useEffect(() => {
    if (!username) return;
    setUsernameStatus("checking");
    const t = setTimeout(async () => {
      const res = await fetch(`/api/username/check?u=${encodeURIComponent(username)}`);
      const data = await res.json();
      setUsernameStatus(data.available ? "ok" : username.length < 3 ? "invalid" : "taken");
    }, 350);
    return () => clearTimeout(t);
  }, [username]);

  const canAdvance = useMemo(() => {
    if (step === 0) return usernameStatus === "ok";
    if (step === 2) return vibeTags.length > 0;
    return true;
  }, [step, usernameStatus, vibeTags]);

  const next = () => {
    play("click");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => {
    play("tick");
    setStep((s) => Math.max(s - 1, 0));
  };

  const finish = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          avatar_config: avatar,
          mood,
          vibe_tags: vibeTags,
          privacy_level: privacy,
          fault_frequency: Object.keys(answers).length ? answers : null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not save.");
      }
      play("flip");
      router.push("/cracks");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSaving(false);
    }
  };

  const toggleVibe = (tag: string) => {
    setVibeTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 3 ? [...prev, tag] : prev
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className={`h-1 flex-1 ${i <= step ? "bg-ink" : "bg-ink/15"}`} />
        ))}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-crack">
        STEP {step + 1} / {STEPS.length} — {STEPS[step]}
      </p>

      {step === 0 && (
        <div className="mt-6">
          <h2 className="font-grotesk text-3xl font-black">Pick a handle.</h2>
          <p className="mt-1 text-sm text-ink/70">Not your name. Just something that's yours.</p>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            className="mt-4 w-full border-2 border-ink bg-transparent px-3 py-3 font-grotesk text-xl outline-none focus:bg-white"
            placeholder="quiet_chaos_04"
          />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wide">
            {usernameStatus === "checking" && <span className="text-grey">CHECKING…</span>}
            {usernameStatus === "ok" && <span className="text-ink">AVAILABLE</span>}
            {usernameStatus === "taken" && <span className="text-crack">ALREADY TAKEN</span>}
            {usernameStatus === "invalid" && (
              <span className="text-crack">3-20 CHARS, LOWERCASE/NUMBERS/UNDERSCORE</span>
            )}
          </p>
        </div>
      )}

      {step === 1 && (
        <div className="mt-6">
          <h2 className="font-grotesk text-3xl font-black">Build your human.</h2>
          <p className="mt-1 text-sm text-ink/70">This is what people see instead of a photo.</p>
          <div className="mt-6">
            <AvatarBuilder config={avatar} mood={mood} onChange={setAvatar} onMoodChange={setMood} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6">
          <h2 className="font-grotesk text-3xl font-black">What's your vibe?</h2>
          <p className="mt-1 text-sm text-ink/70">Pick up to 3. No wrong answers, only true ones.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {VIBE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleVibe(tag)}
                className={`border-2 px-3 py-2 font-mono text-[11px] uppercase tracking-wide ${
                  vibeTags.includes(tag) ? "border-ink bg-ink text-paper" : "border-ink/30 hover:border-ink"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6">
          <h2 className="font-grotesk text-3xl font-black">How visible do you want to be?</h2>
          <div className="mt-4 space-y-2">
            {PRIVACY_LEVELS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPrivacy(p.key)}
                className={`block w-full border-2 p-4 text-left ${
                  privacy === p.key ? "border-ink bg-white" : "border-ink/30"
                }`}
              >
                <p className="font-mono text-xs uppercase tracking-widest">{p.label}</p>
                <p className="mt-1 text-sm text-ink/70">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-6">
          <h2 className="font-grotesk text-3xl font-black">Find your fault frequency.</h2>
          <p className="mt-1 text-sm text-ink/70">
            Optional — helps us point you at communities that get it. Skip if you'd rather not.
          </p>
          <div className="mt-6 space-y-6">
            {FAULT_FREQUENCY_QUESTIONS.map((q) => (
              <div key={q.id}>
                <p className="font-mono text-xs uppercase tracking-wide text-ink">{q.prompt}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {q.options.map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: o.key }))}
                      className={`border-2 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide ${
                        answers[q.id] === o.key ? "border-ink bg-ink text-paper" : "border-ink/30 hover:border-ink"
                      }`}
                    >
                      {o.key}. {o.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="mt-6 text-center">
          <p className="text-6xl">{mood}</p>
          <h2 className="mt-4 font-grotesk text-3xl font-black">WELCOME, HUMAN.</h2>
          <p className="mt-2 text-sm text-ink/70">@{username} is ready.</p>
          {error && <p className="mt-3 font-mono text-[10px] uppercase text-crack">{error}</p>}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="font-mono text-[10px] uppercase tracking-widest text-grey disabled:opacity-0"
        >
          ← back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance}
            className="border-2 border-ink bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-paper disabled:opacity-40"
          >
            CONTINUE →
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={saving}
            className="border-2 border-ink bg-crack px-6 py-3 font-mono text-xs uppercase tracking-widest text-paper disabled:opacity-50"
          >
            {saving ? "ENTERING…" : "ENTER FAULT LINE →"}
          </button>
        )}
      </div>
    </div>
  );
}
