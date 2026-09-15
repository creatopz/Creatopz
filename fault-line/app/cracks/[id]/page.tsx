import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import PostCard from "@/components/PostCard";
import CommentThread from "@/components/CommentThread";
import { Post } from "@/lib/types";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error } = await supabase
    .from("posts_with_counts")
    .select("*, profile:profiles(id, username, avatar_config, mood, privacy_level)")
    .eq("id", params.id)
    .single();

  if (error || !post) notFound();

  let my_reaction: string | null = null;
  let avatarConfig = null;
  if (user) {
    const [{ data: reaction }, { data: profile }] = await Promise.all([
      supabase
        .from("reactions")
        .select("reaction_type")
        .eq("user_id", user.id)
        .eq("post_id", params.id)
        .maybeSingle(),
      supabase.from("profiles").select("avatar_config").eq("id", user.id).single(),
    ]);
    my_reaction = reaction?.reaction_type ?? null;
    avatarConfig = profile?.avatar_config;
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("*, profile:profiles(username, avatar_config, privacy_level)")
    .eq("post_id", params.id)
    .eq("status", "visible")
    .order("created_at", { ascending: true });

  return (
    <>
      <Nav isAuthed={!!user} avatarConfig={avatarConfig} />
      <main className="mx-auto max-w-2xl px-6 py-10 pb-28 md:pb-10">
        <PostCard post={{ ...post, my_reaction } as Post} isAuthed={!!user} />
        <CommentThread postId={params.id} initialComments={comments ?? []} isAuthed={!!user} />
      </main>
      <MobileNav />
    </>
  );
}
