import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_KINDS = ["me_too", "felt_that", "ouch", "hug"];

/** Toggles a reaction: adds it if the user hasn't reacted this way yet, removes it if they have. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const kind = body?.kind;
  if (!VALID_KINDS.includes(kind)) {
    return NextResponse.json({ error: "Invalid reaction." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("kind", kind)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("reactions").delete().eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ reacted: false });
  }

  const { error } = await supabase.from("reactions").insert({ post_id: postId, user_id: user.id, kind });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ reacted: true });
}
