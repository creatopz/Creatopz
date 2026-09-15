import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { REACTION_TYPES } from "@/lib/types";

const VALID = new Set(REACTION_TYPES.map((r) => r.key));

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const reaction_type = body?.reaction_type;
  if (!VALID.has(reaction_type)) {
    return NextResponse.json({ error: "Invalid reaction." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("reactions")
    .select("id, reaction_type")
    .eq("user_id", user.id)
    .eq("post_id", params.id)
    .maybeSingle();

  if (existing && existing.reaction_type === reaction_type) {
    // Toggling the same reaction off.
    await supabase.from("reactions").delete().eq("id", existing.id);
    return NextResponse.json({ mine: null });
  }

  const { error } = await supabase.from("reactions").upsert(
    { user_id: user.id, post_id: params.id, reaction_type },
    { onConflict: "user_id,post_id" }
  );
  if (error) return NextResponse.json({ error: "Could not react." }, { status: 500 });

  return NextResponse.json({ mine: reaction_type });
}
