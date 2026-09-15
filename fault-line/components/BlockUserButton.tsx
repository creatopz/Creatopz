"use client";

import { useState } from "react";

export default function BlockUserButton({ userId, initiallyBlocked }: { userId: string; initiallyBlocked: boolean }) {
  const [blocked, setBlocked] = useState(initiallyBlocked);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    setPending(true);
    try {
      await fetch(`/api/users/${userId}/block`, { method: blocked ? "DELETE" : "POST" });
      setBlocked((b) => !b);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`border-2 px-3 py-2 font-mono text-[10px] uppercase tracking-widest ${
        blocked ? "border-crack bg-crack text-paper" : "border-ink/30 text-ink/70 hover:border-crack hover:text-crack"
      }`}
    >
      {blocked ? "UNBLOCK" : "BLOCK"}
    </button>
  );
}
