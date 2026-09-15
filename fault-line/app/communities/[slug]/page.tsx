import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import PostComposer from "@/components/PostComposer";
import FeedList from "@/components/FeedList";
import CommunityCard from "@/components/CommunityCard";
import { Post } from "@/lib/types";

export default async function CommunityPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", params.slug)
    .single();
  if (!community) notFound();

  let avatarConfig = null;
  let isMember = false;
  if (user) {
    const [{ data: profile }, { data: membership }] = await Promise.all([
      supabase.from("profiles").select("avatar_config").eq("id", user.id).single(),
      supabase
        .from("community_members")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("community_id", community.id)
        .maybeSingle(),
    ]);
    avatarConfig = profile?.avatar_config;
    isMember = !!membership;
  }

  const { count: memberCount } = await supabase
    .from("community_members")
    .select("user_id", { count: "exact", head: true })
    .eq("community_id", community.id);

  const { data: posts } = await supabase
    .from("posts_with_counts")
    .select("*, profile:profiles(id, username, avatar_config, mood, privacy_level)")
    .eq("status", "visible")
    .eq("community_id", community.id)
    .order("created_at", { ascending: false })
    .limit(20);

  let myReactions: Record<string, string> = {};
  if (user && posts?.length) {
    const { data: reactions } = await supabase
      .from("reactions")
      .select("post_id, reaction_type")
      .eq("user_id", user.id)
      .in("post_id", posts.map((p) => p.id));
    myReactions = Object.fromEntries((reactions ?? []).map((r) => [r.post_id, r.reaction_type]));
  }

  const shaped: Post[] = (posts ?? []).map((p) => ({ ...p, my_reaction: myReactions[p.id] ?? null })) as Post[];

  return (
    <>
      <Nav isAuthed={!!user} avatarConfig={avatarConfig} />
      <main className="mx-auto max-w-2xl px-6 py-10 pb-28 md:pb-10">
        <div className="max-w-xs">
          <CommunityCard
            community={{ ...community, member_count: memberCount ?? 0, is_member: isMember }}
            isAuthed={!!user}
          />
        </div>

        {user && (
          <div className="mt-8">
            <PostComposer communityId={community.id} />
          </div>
        )}

        <div className="mt-10">
          <FeedList
            initialPosts={shaped}
            initialCursor={shaped.at(-1)?.created_at ?? null}
            isAuthed={!!user}
            communityId={community.id}
          />
        </div>
      </main>
      <MobileNav />
    </>
  );
}
