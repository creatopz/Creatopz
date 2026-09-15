import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import PostComposer from "@/components/PostComposer";
import FeedList from "@/components/FeedList";
import { Post } from "@/lib/types";

export default async function CracksPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/cracks");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_config, onboarded")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarded) redirect("/onboarding");

  const { data: blocks } = await supabase.from("user_blocks").select("blocked_id").eq("blocker_id", user.id);
  const blockedIds = (blocks ?? []).map((b) => b.blocked_id);

  let feedQuery = supabase
    .from("posts_with_counts")
    .select("*, profile:profiles(id, username, avatar_config, mood, privacy_level)")
    .eq("status", "visible")
    .order("created_at", { ascending: false })
    .limit(20);
  if (blockedIds.length) feedQuery = feedQuery.not("user_id", "in", `(${blockedIds.join(",")})`);

  const { data: posts } = await feedQuery;

  const ids = (posts ?? []).map((p) => p.id);
  let myReactions: Record<string, string> = {};
  if (ids.length) {
    const { data: reactions } = await supabase
      .from("reactions")
      .select("post_id, reaction_type")
      .eq("user_id", user.id)
      .in("post_id", ids);
    myReactions = Object.fromEntries((reactions ?? []).map((r) => [r.post_id, r.reaction_type]));
  }

  const shaped: Post[] = (posts ?? []).map((p) => ({
    ...p,
    my_reaction: myReactions[p.id] ?? null,
  })) as Post[];

  return (
    <>
      <Nav isAuthed avatarConfig={profile.avatar_config} />
      <main className="mx-auto max-w-2xl px-6 py-10 pb-28 md:pb-10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">[ PUBLIC CONFESSION FEED ]</p>
        <h1 className="mt-2 font-grotesk text-4xl font-black uppercase">The Cracks.</h1>
        <p className="mt-2 text-sm text-ink/70">Where the performance stops.</p>

        <div className="mt-6">
          <PostComposer />
        </div>

        <div className="mt-10">
          <FeedList initialPosts={shaped} initialCursor={shaped.at(-1)?.created_at ?? null} isAuthed />
        </div>
      </main>
      <MobileNav />
    </>
  );
}
