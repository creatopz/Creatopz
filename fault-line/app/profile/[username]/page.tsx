import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import PixelAvatar from "@/components/PixelAvatar";
import PostCard from "@/components/PostCard";
import BlockUserButton from "@/components/BlockUserButton";
import { Post } from "@/lib/types";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single();
  if (!profile) notFound();

  const isOwnProfile = user?.id === profile.id;

  let viewerAvatar = null;
  let isBlocked = false;
  if (user) {
    const [{ data: viewer }, { data: block }] = await Promise.all([
      supabase.from("profiles").select("avatar_config").eq("id", user.id).single(),
      supabase
        .from("user_blocks")
        .select("blocker_id")
        .eq("blocker_id", user.id)
        .eq("blocked_id", profile.id)
        .maybeSingle(),
    ]);
    viewerAvatar = viewer?.avatar_config;
    isBlocked = !!block;
  }

  const { data: posts } = await supabase
    .from("posts_with_counts")
    .select("*, profile:profiles(id, username, avatar_config, mood, privacy_level)")
    .eq("user_id", profile.id)
    .eq("status", "visible")
    .order("created_at", { ascending: false })
    .limit(30);

  // "Humans who felt this" — total reactions received across this person's
  // posts, shown instead of a follower/following count.
  const postIds = (posts ?? []).map((p) => p.id);
  let feltCount = 0;
  if (postIds.length) {
    const { count } = await supabase
      .from("reactions")
      .select("id", { count: "exact", head: true })
      .in("post_id", postIds);
    feltCount = count ?? 0;
  }

  const shaped = (posts ?? []) as unknown as Post[];

  return (
    <>
      <Nav isAuthed={!!user} avatarConfig={viewerAvatar} />
      <main className="mx-auto max-w-2xl px-6 py-10 pb-28 md:pb-10">
        <div className="flex items-start gap-4 border-b-2 border-ink pb-6">
          <PixelAvatar config={profile.avatar_config} size={72} />
          <div className="flex-1">
            <h1 className="font-grotesk text-2xl font-black">@{profile.username}</h1>
            <p className="font-mono text-2xl leading-none">{profile.mood}</p>
            {profile.bio && <p className="mt-2 text-sm text-ink/80">{profile.bio}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.vibe_tags?.map((t: string) => (
                <span key={t} className="border border-ink/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-6 font-mono text-[10px] uppercase tracking-widest text-grey">
              <span>
                <b className="text-ink">{feltCount}</b> humans who felt this
              </span>
              <span>joined {new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          {isOwnProfile ? (
            <Link
              href="/account"
              className="border-2 border-ink px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink hover:bg-ink hover:text-paper"
            >
              SETTINGS
            </Link>
          ) : (
            user && <BlockUserButton userId={profile.id} initiallyBlocked={isBlocked} />
          )}
        </div>

        <div className="mt-8">
          {shaped.length === 0 ? (
            <p className="font-mono text-xs uppercase tracking-wide text-grey">No cracks yet.</p>
          ) : (
            shaped.map((post) => <PostCard key={post.id} post={post} isAuthed={!!user} />)
          )}
        </div>
      </main>
      <MobileNav />
    </>
  );
}
