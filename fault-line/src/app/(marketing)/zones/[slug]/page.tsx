import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ZoneJoinButton } from "@/components/zones/ZoneJoinButton";
import { PostCard, type FeedPost } from "@/components/feed/PostCard";

const ACCENT: Record<string, string> = { red: "#FF3B30", blue: "#245CFF", acid: "#C7FF00", ink: "#111111" };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

export default async function ZoneDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: zone } = await supabase
    .from("fault_zones")
    .select("id, slug, name, description, theme")
    .eq("slug", slug)
    .maybeSingle();

  if (!zone) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: memberCount }, { data: membership }, { data: posts }] = await Promise.all([
    supabase.from("zone_members").select("user_id", { count: "exact", head: true }).eq("zone_id", zone.id),
    user
      ? supabase.from("zone_members").select("user_id").eq("zone_id", zone.id).eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("posts")
      .select(
        "id, content, emotional_tags, zone_id, created_at, author:profiles(id, anonymous_username, avatar_config, avatar_expression), reactions(kind, user_id)"
      )
      .eq("zone_id", zone.id)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <div className="px-5 md:px-10 py-16 md:py-24">
      <div className="mx-auto max-w-[820px]">
        <div className="w-4 h-4 mb-5" style={{ background: ACCENT[zone.theme] ?? "#111" }} />
        <h1 className="font-grotesk font-black uppercase text-huge mb-4">{zone.name}</h1>
        <p className="text-lg opacity-80 max-w-[52ch] mb-3">{zone.description}</p>
        <p className="sys text-xs opacity-50 mb-8">{memberCount ?? 0} PEOPLE GET THIS. YOU&apos;RE NOT THE ONLY ONE.</p>

        <ZoneJoinButton zoneId={zone.id} isMember={!!membership} isSignedIn={!!user} />

        <div className="rule my-10" />

        <div className="flex flex-col gap-5">
          {(posts ?? []).length === 0 && (
            <p className="sys text-xs opacity-50 text-center py-16">NOBODY&apos;S SAID ANYTHING HERE YET.</p>
          )}
          {(posts as unknown as FeedPost[] | null)?.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user?.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
