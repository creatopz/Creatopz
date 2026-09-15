import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { VIBE_TAGS, PRIVACY_LEVELS } from "@/lib/types";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const username = String(body.username ?? "").toLowerCase().trim();
  const avatar_config = body.avatar_config;
  const mood = String(body.mood ?? ":|");
  const bio = body.bio ? String(body.bio).slice(0, 200) : null;
  const vibe_tags: string[] = Array.isArray(body.vibe_tags)
    ? body.vibe_tags.filter((t: string) => (VIBE_TAGS as readonly string[]).includes(t)).slice(0, 3)
    : [];
  const privacy_level = String(body.privacy_level ?? "pseudonymous");
  const fault_frequency = body.fault_frequency ?? null;

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json({ error: "Invalid username." }, { status: 400 });
  }
  if (!PRIVACY_LEVELS.some((p) => p.key === privacy_level)) {
    return NextResponse.json({ error: "Invalid privacy level." }, { status: 400 });
  }
  if (!avatar_config || typeof avatar_config !== "object") {
    return NextResponse.json({ error: "Invalid avatar." }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      avatar_config,
      mood,
      bio,
      vibe_tags,
      privacy_level,
      fault_frequency,
      onboarded: true,
    })
    .eq("id", user.id);

  if (error) {
    const message = error.code === "23505" ? "That username is taken." : "Could not save. Try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
