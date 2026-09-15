import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 500) : "";
  const postId = typeof body?.post_id === "string" ? body.post_id : null;
  const commentId = typeof body?.comment_id === "string" ? body.comment_id : null;
  const reportedUserId = typeof body?.reported_user_id === "string" ? body.reported_user_id : null;

  if (!reason) return NextResponse.json({ error: "Tell us a little about what's wrong." }, { status: 400 });
  if (!postId && !commentId && !reportedUserId) {
    return NextResponse.json({ error: "Nothing to report." }, { status: 400 });
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    post_id: postId,
    comment_id: commentId,
    reported_user_id: reportedUserId,
    reason,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
