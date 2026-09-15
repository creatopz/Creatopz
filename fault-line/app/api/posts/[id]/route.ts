import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error } = await supabase
    .from("posts_with_counts")
    .select("*, profile:profiles(id, username, avatar_config, mood, privacy_level)")
    .eq("id", params.id)
    .single();

  if (error || !post) return NextResponse.json({ error: "Not found." }, { status: 404 });

  let my_reaction: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("reactions")
      .select("reaction_type")
      .eq("user_id", user.id)
      .eq("post_id", params.id)
      .maybeSingle();
    my_reaction = data?.reaction_type ?? null;
  }

  return NextResponse.json({ post: { ...post, my_reaction } });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  // RLS also enforces own-post-or-moderator, this is belt-and-suspenders.
  const { error } = await supabase.from("posts").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: "Could not delete." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
