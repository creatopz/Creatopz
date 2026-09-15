"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { playSound } from "@/lib/sound";

export function ZoneJoinButton({
  zoneId,
  isMember,
  isSignedIn,
}: {
  zoneId: string;
  isMember: boolean;
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [member, setMember] = useState(isMember);
  const [loading, setLoading] = useState(false);

  if (!isSignedIn) {
    return (
      <Link href="/auth/sign-up" className="btn">
        JOIN THIS ZONE →
      </Link>
    );
  }

  async function toggle() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (member) {
      await supabase.from("zone_members").delete().eq("zone_id", zoneId).eq("user_id", user.id);
    } else {
      await supabase.from("zone_members").insert({ zone_id: zoneId, user_id: user.id });
    }

    playSound(member ? "click" : "success");
    setMember(!member);
    setLoading(false);
    router.refresh();
  }

  return (
    <button type="button" onClick={toggle} disabled={loading} className={member ? "btn btn-outline" : "btn"}>
      {loading ? "…" : member ? "LEAVE ZONE" : "JOIN THIS ZONE →"}
    </button>
  );
}
