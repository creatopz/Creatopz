"use client";

import { useState } from "react";
import { createCommunity } from "@/app/admin/actions";

export default function CommunityAdminForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const form = new FormData(e.currentTarget);
        const res = await createCommunity({
          slug: String(form.get("slug")),
          name: String(form.get("name")),
          description: String(form.get("description")),
          icon: String(form.get("icon") || "◎"),
          tags: String(form.get("tags") || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        });
        setPending(false);
        if (res.error) setError(res.error);
        else e.currentTarget.reset();
      }}
    >
      <input name="name" placeholder="NAME" required className="w-full border border-paper/30 bg-transparent px-2 py-1.5 text-sm" />
      <input name="slug" placeholder="slug-like-this" required className="w-full border border-paper/30 bg-transparent px-2 py-1.5 text-sm" />
      <textarea name="description" placeholder="Description" required className="w-full border border-paper/30 bg-transparent px-2 py-1.5 text-sm" />
      <div className="flex gap-2">
        <input name="icon" placeholder="◎" maxLength={2} className="w-16 border border-paper/30 bg-transparent px-2 py-1.5 text-sm" />
        <input name="tags" placeholder="tag1, tag2" className="flex-1 border border-paper/30 bg-transparent px-2 py-1.5 text-sm" />
      </div>
      {error && <p className="font-mono text-[10px] text-crack">{error}</p>}
      <button
        disabled={pending}
        className="w-full border border-acid bg-transparent px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-acid hover:bg-acid hover:text-ink"
      >
        {pending ? "…" : "CREATE COMMUNITY"}
      </button>
    </form>
  );
}
