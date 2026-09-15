"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EMOTIONAL_TAGS, MAX_POST_LENGTH } from "@/lib/posts";
import { CRISIS_RESOURCES } from "@/lib/safety";
import { playSound } from "@/lib/sound";
import { cx } from "@/lib/utils";

export function PostComposer({ zones }: { zones: { id: string; name: string }[] }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [zoneId, setZoneId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const hadText = useRef(false);

  const hint =
    content.length === 0 && hadText.current
      ? "SOMETIMES IT'S HARD TO SAY."
      : content.length > 0 && content.trim().length <= 12
        ? "THAT'S ALL? FAIR ENOUGH."
        : null;

  function toggleTag(tag: string) {
    playSound("click");
    setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (content.trim().length === 0) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim(), emotional_tags: tags, zone_id: zoneId || undefined }),
    });

    setSubmitting(false);

    const resBody = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(resBody.error ?? "Couldn't post that. Try again.");
      playSound("error");
      return;
    }

    if (resBody.crisis) setShowCrisisResources(true);

    playSound("success");
    setContent("");
    setTags([]);
    setZoneId("");
    hadText.current = false;
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="border-2 border-ink bg-paper p-5 md:p-7">
      <h2 className="font-grotesk font-black uppercase text-xl md:text-2xl mb-4">
        WHAT ARE YOU PRETENDING DOESN&apos;T BOTHER YOU?
      </h2>

      <textarea
        value={content}
        onChange={(e) => {
          const v = e.target.value.slice(0, MAX_POST_LENGTH);
          if (v.length > 0) hadText.current = true;
          setContent(v);
        }}
        placeholder="say the true thing…"
        rows={4}
        className="w-full resize-none bg-transparent border border-ink/25 p-4 text-lg outline-none focus:border-ink placeholder:text-ink/35"
      />

      <div className="flex items-center justify-between mt-1 mb-4">
        <p className="sys text-[10px] opacity-40 h-4">{hint}</p>
        <p className="sys text-[10px] opacity-40">
          {content.length} / {MAX_POST_LENGTH}
        </p>
      </div>

      <p className="field-label">Tag how it feels (optional, pick any)</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {EMOTIONAL_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={cx("tag-chip", tags.includes(tag) && "bg-ink text-paper")}
          >
            [ {tag} ]
          </button>
        ))}
      </div>

      {zones.length > 0 && (
        <div className="mb-5">
          <label className="field-label" htmlFor="zone">
            Post to (optional)
          </label>
          <select id="zone" className="field" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
            <option value="">Public feed</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red border border-red/40 bg-red/5 px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting || content.trim().length === 0} className="btn disabled:opacity-40">
        {submitting ? "LETTING IT OUT…" : "LET IT OUT →"}
      </button>

      {showCrisisResources && (
        <div className="mt-5 border-2 border-red bg-red/5 p-5">
          <p className="font-grotesk font-black uppercase mb-2">IF THIS IS HEAVY RIGHT NOW, YOU DON&apos;T HAVE TO CARRY IT ALONE.</p>
          <ul className="flex flex-col gap-1 mb-3">
            {CRISIS_RESOURCES.map((r) => (
              <li key={r.name} className="sys text-xs">
                {r.name} ({r.region}) — <a href={r.contact} className="underline underline-offset-2">{r.contact.replace(/^tel:/, "")}</a>{" "}
                <span className="opacity-50">· {r.note}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="sys text-[11px] underline underline-offset-4 opacity-70" onClick={() => setShowCrisisResources(false)}>
            close
          </button>
        </div>
      )}
    </form>
  );
}
