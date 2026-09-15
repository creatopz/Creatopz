"use client";

import { useTransition } from "react";
import { toggleZoneFeatured, toggleZoneArchived } from "./actions";
import { cx } from "@/lib/utils";

type Zone = { id: string; name: string; description: string; theme: string; is_featured: boolean; is_archived: boolean };

export function ZoneRow({ zone, memberCount }: { zone: Zone; memberCount: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={cx("border border-ink/20 bg-paper p-5 flex items-start justify-between gap-4 flex-wrap", zone.is_archived && "opacity-50")}>
      <div>
        <p className="font-grotesk font-black uppercase">{zone.name}</p>
        <p className="text-sm opacity-70 max-w-[46ch]">{zone.description}</p>
        <p className="sys text-[10px] opacity-50 mt-1">{memberCount} MEMBERS · THEME: {zone.theme.toUpperCase()}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          disabled={pending}
          className={cx("tag-chip", zone.is_featured && "bg-ink text-paper")}
          onClick={() => startTransition(() => toggleZoneFeatured(zone.id, !zone.is_featured))}
        >
          {zone.is_featured ? "FEATURED" : "FEATURE"}
        </button>
        <button
          type="button"
          disabled={pending}
          className="tag-chip"
          style={{ borderColor: "#FF3B30", color: "#FF3B30" }}
          onClick={() => startTransition(() => toggleZoneArchived(zone.id, !zone.is_archived))}
        >
          {zone.is_archived ? "RESTORE" : "ARCHIVE"}
        </button>
      </div>
    </div>
  );
}
