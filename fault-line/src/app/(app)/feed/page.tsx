import { createClient } from "@/lib/supabase/server";
import { PostComposer } from "@/components/feed/PostComposer";
import { PostCard, type FeedPost } from "@/components/feed/PostCard";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: posts }, { data: zones }] = await Promise.all([
    supabase
      .from("posts")
      .select(
        "id, content, emotional_tags, zone_id, created_at, author:profiles(id, anonymous_username, avatar_config, avatar_expression), reactions(kind, user_id)"
      )
      .eq("is_hidden", false)
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase.from("fault_zones").select("id, name").eq("is_archived", false).order("name"),
  ]);

  return (
    <div className="mx-auto max-w-[720px] px-5 md:px-8 py-10 flex flex-col gap-8">
      <PostComposer zones={zones ?? []} />

      <div className="rule" />

      <div className="flex flex-col gap-5">
        {(posts ?? []).length === 0 && (
          <p className="sys text-xs opacity-50 text-center py-16">
            NOTHING HERE YET. BE THE FIRST FAULT LINE.
          </p>
        )}
        {(posts as unknown as FeedPost[] | null)?.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={user?.id} />
        ))}
      </div>
    </div>
  );
}
