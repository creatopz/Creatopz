import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectRiskSignal } from "@/lib/safety";

const PAGE_SIZE = 20;
const RATE_LIMIT_WINDOW_MINUTES = 5;
const RATE_LIMIT_MAX_POSTS = 5;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor"); // created_at of last item on the client
  const communityId = searchParams.get("community_id");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("posts_with_counts")
    .select("*, profile:profiles(id, username, avatar_config, mood, privacy_level)")
    .eq("status", "visible")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (communityId) query = query.eq("community_id", communityId);
  if (cursor) query = query.lt("created_at", cursor);

  if (user) {
    const { data: blocks } = await supabase.from("user_blocks").select("blocked_id").eq("blocker_id", user.id);
    const blockedIds = (blocks ?? []).map((b) => b.blocked_id);
    if (blockedIds.length) query = query.not("user_id", "in", `(${blockedIds.join(",")})`);
  }

  const { data: posts, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let myReactions: Record<string, string> = {};
  if (user && posts && posts.length > 0) {
    const { data: reactions } = await supabase
      .from("reactions")
      .select("post_id, reaction_type")
      .eq("user_id", user.id)
      .in("post_id", posts.map((p) => p.id));
    myReactions = Object.fromEntries((reactions ?? []).map((r) => [r.post_id, r.reaction_type]));
  }

  const shaped = (posts ?? []).map((p) => ({ ...p, my_reaction: myReactions[p.id] ?? null }));

  return NextResponse.json({
    posts: shaped,
    nextCursor: posts && posts.length === PAGE_SIZE ? posts[posts.length - 1].created_at : null,
  });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("suspended")
    .eq("id", user.id)
    .single();
  if (profile?.suspended) {
    return NextResponse.json({ error: "Your account is suspended." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const content = String(body?.content ?? "").trim();
  const visibility = ["public", "community", "anonymous"].includes(body?.visibility)
    ? body.visibility
    : "public";
  const community_id = body?.community_id ?? null;

  if (!content || content.length > 500) {
    return NextResponse.json({ error: "Content must be 1-500 characters." }, { status: 400 });
  }

  // Basic backend rate limit — mirrors the composer's UX guardrails but is
  // enforced server-side so it can't be bypassed by calling the API directly.
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= RATE_LIMIT_MAX_POSTS) {
    return NextResponse.json(
      { error: `Slow down — max ${RATE_LIMIT_MAX_POSTS} posts every ${RATE_LIMIT_WINDOW_MINUTES} minutes.` },
      { status: 429 }
    );
  }

  const risk_flag = detectRiskSignal(content);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      content,
      visibility,
      community_id,
      risk_flag,
      status: risk_flag ? "under_review" : "visible",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Could not post." }, { status: 500 });

  // A risk-flagged post is queued for human review instead of published
  // immediately (see moderation_logs / admin reports queue) rather than
  // treated as ordinary engagement content.
  if (risk_flag) {
    await supabase.from("reports").insert({
      reporter_id: user.id,
      content_type: "post",
      content_id: data.id,
      reason: "AUTO-FLAGGED: possible self-harm risk signal in content",
      status: "open",
    });
  }

  return NextResponse.json({ post: data }, { status: 201 });
}
