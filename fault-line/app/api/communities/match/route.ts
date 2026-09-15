import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SIGNATURE_COMMUNITIES } from "@/lib/faultFrequency";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const signature = searchParams.get("signature") ?? "B";
  const slugs = SIGNATURE_COMMUNITIES[signature] ?? SIGNATURE_COMMUNITIES.B;

  const supabase = createClient();
  const { data: communities, error } = await supabase.from("communities").select("*").in("slug", slugs);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: counts } = await supabase
    .from("community_members")
    .select("community_id")
    .in("community_id", (communities ?? []).map((c) => c.id));
  const countMap: Record<string, number> = {};
  (counts ?? []).forEach((c) => (countMap[c.community_id] = (countMap[c.community_id] ?? 0) + 1));

  const shaped = (communities ?? []).map((c) => ({ ...c, member_count: countMap[c.id] ?? 0 }));
  return NextResponse.json({ communities: shaped });
}
