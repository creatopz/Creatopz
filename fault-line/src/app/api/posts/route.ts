import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { EMOTIONAL_TAGS, MAX_POST_LENGTH, DAILY_POST_LIMIT } from "@/lib/posts";
import { containsCrisisLanguage, CRISIS_RESOURCES } from "@/lib/safety";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const zoneId = searchParams.get("zone_id");
  const cursor = searchParams.get("before"); // an ISO created_at, for pagination

  let query = supabase
    .from("posts")
    .select(
      "id, content, emotional_tags, zone_id, created_at, author:profiles(id, anonymous_username, avatar_config, avatar_expression), reactions(kind, user_id)"
    )
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(20);

  if (zoneId) query = query.eq("zone_id", zoneId);
  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ posts: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.content !== "string") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const content = body.content.trim();
  if (content.length < 1 || content.length > MAX_POST_LENGTH) {
    return NextResponse.json({ error: `Post must be between 1 and ${MAX_POST_LENGTH} characters.` }, { status: 400 });
  }

  const tags: string[] = Array.isArray(body.emotional_tags)
    ? body.emotional_tags.filter((t: unknown) => typeof t === "string" && (EMOTIONAL_TAGS as readonly string[]).includes(t))
    : [];

  const zoneId = typeof body.zone_id === "string" && body.zone_id.length > 0 ? body.zone_id : null;

  // simple, real rate limit: count this user's posts in the last 24h.
  // RLS lets a user select their own posts, so this works on the normal
  // (non-service-role) server client.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id)
    .gte("created_at", since);

  if ((count ?? 0) >= DAILY_POST_LIMIT) {
    return NextResponse.json({ error: "You've hit today's posting limit. Come back tomorrow." }, { status: 429 });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      content,
      emotional_tags: tags,
      zone_id: zoneId,
      visibility: zoneId ? "zone_only" : "public",
    })
    .select("id, content, emotional_tags, zone_id, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const flagged = containsCrisisLanguage(content);
  if (flagged) {
    // never blocks the post — just opens a queue item for a human, fast
    await supabase.from("reports").insert({
      reporter_id: user.id,
      post_id: data.id,
      reason: "Auto-flagged: possible crisis language. Not reported by another user.",
    });
  }

  return NextResponse.json({ post: data, crisis: flagged ? { resources: CRISIS_RESOURCES } : undefined }, { status: 201 });
}
