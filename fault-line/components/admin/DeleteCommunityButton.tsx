"use client";

import { useState, useTransition } from "react";
import { deleteCommunity } from "@/app/admin/actions";

export default function DeleteCommunityButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <button
        disabled={pending}
        onClick={() => startTransition(() => deleteCommunity(id))}
        className="border border-crack bg-crack px-2 py-1 font-mono text-[10px] uppercase text-paper"
      >
        confirm
      </button>
    );
  }
  return (
    <button
      onClick={() => setConfirming(true)}
      className="border border-paper/30 px-2 py-1 font-mono text-[10px] uppercase hover:border-crack hover:text-crack"
    >
      delete
    </button>
  );
}
