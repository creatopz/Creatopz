import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: communities, error } = await supabase
    .from("communities")
    .select("*")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: memberCounts } = await supabase
    .from("community_members")
    .select("community_id");
  const counts: Record<string, number> = {};
  (memberCounts ?? []).forEach((m) => {
    counts[m.community_id] = (counts[m.community_id] ?? 0) + 1;
  });

  let myMemberships = new Set<string>();
  if (user) {
    const { data } = await supabase
      .from("community_members")
      .select("community_id")
      .eq("user_id", user.id);
    myMemberships = new Set((data ?? []).map((m) => m.community_id));
  }

  const shaped = (communities ?? []).map((c) => ({
    ...c,
    member_count: counts[c.id] ?? 0,
    is_member: myMemberships.has(c.id),
  }));

  return NextResponse.json({ communities: shaped });
}
