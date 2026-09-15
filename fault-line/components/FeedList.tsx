"use client";

import { useState } from "react";
import PostCard from "@/components/PostCard";
import { Post } from "@/lib/types";

export default function FeedList({
  initialPosts,
  initialCursor,
  isAuthed,
  communityId,
}: {
  initialPosts: Post[];
  initialCursor: string | null;
  isAuthed: boolean;
  communityId?: string;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ cursor });
      if (communityId) params.set("community_id", communityId);
      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      setPosts((prev) => [...prev, ...data.posts]);
      setCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  };

  if (posts.length === 0) {
    return (
      <p className="border-2 border-dashed border-ink/30 p-8 text-center font-mono text-xs uppercase tracking-wide text-grey">
        Nothing here yet. Be the first crack.
      </p>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} isAuthed={isAuthed} />
      ))}
      {cursor && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="mx-auto mt-8 block border-2 border-ink px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-ink hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {loading ? "LOADING…" : "LOAD MORE CRACKS"}
        </button>
      )}
    </div>
  );
}
