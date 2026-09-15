import Link from "next/link";
import PixelAvatar from "@/components/PixelAvatar";
import ReactionBar from "@/components/ReactionBar";
import { Post } from "@/lib/types";
import { faultTimestamp } from "@/lib/time";
import { DEFAULT_AVATAR } from "@/lib/types";
import ReportButton from "@/components/ReportButton";

export default function PostCard({ post, isAuthed }: { post: Post; isAuthed: boolean }) {
  const displayName =
    post.visibility === "anonymous" || post.profile?.privacy_level === "anonymous"
      ? "anonymous-ish"
      : post.profile?.username ?? "anonymous-ish";

  return (
    <article className="border-b-2 border-ink py-6 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <PixelAvatar config={post.profile?.avatar_config ?? DEFAULT_AVATAR} size={36} />
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-ink">{displayName}</p>
            <p className="font-mono text-[10px] text-grey">{faultTimestamp(post.created_at)}</p>
          </div>
        </div>
        <ReportButton contentType="post" contentId={post.id} />
      </div>

      <p className="mt-4 whitespace-pre-wrap text-lg leading-snug text-ink md:text-xl">
        {post.content}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <ReactionBar
          postId={post.id}
          counts={post.reaction_counts ?? {}}
          myReaction={post.my_reaction ?? null}
          isAuthed={isAuthed}
        />
        <Link
          href={`/cracks/${post.id}`}
          data-cursor="CLICK"
          className="font-mono text-[10px] uppercase tracking-wide text-grey hover:text-ink"
        >
          💬 {post.comment_count ?? 0}
        </Link>
      </div>
    </article>
  );
}
