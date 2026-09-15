import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profile:profiles(id, username, avatar_config, privacy_level)")
    .eq("post_id", params.id)
    .eq("status", "visible")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const content = String(body?.content ?? "").trim();
  if (!content || content.length > 500) {
    return NextResponse.json({ error: "Content must be 1-500 characters." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ user_id: user.id, post_id: params.id, content })
    .select("*, profile:profiles(id, username, avatar_config, privacy_level)")
    .single();

  if (error) return NextResponse.json({ error: "Could not comment." }, { status: 500 });
  return NextResponse.json({ comment: data }, { status: 201 });
}
