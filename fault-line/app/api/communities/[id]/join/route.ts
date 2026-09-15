import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const { error } = await supabase
    .from("community_members")
    .upsert({ user_id: user.id, community_id: params.id }, { onConflict: "user_id,community_id" });
  if (error) return NextResponse.json({ error: "Could not join." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("user_id", user.id)
    .eq("community_id", params.id);
  if (error) return NextResponse.json({ error: "Could not leave." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
