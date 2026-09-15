import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import CommunityCard from "@/components/CommunityCard";
import Link from "next/link";

export default async function CommunitiesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let avatarConfig = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_config")
      .eq("id", user.id)
      .single();
    avatarConfig = profile?.avatar_config;
  }

  const { data: communities } = await supabase.from("communities").select("*").order("name");
  const { data: memberCounts } = await supabase.from("community_members").select("community_id");
  const counts: Record<string, number> = {};
  (memberCounts ?? []).forEach((m) => (counts[m.community_id] = (counts[m.community_id] ?? 0) + 1));

  let myMemberships = new Set<string>();
  if (user) {
    const { data } = await supabase.from("community_members").select("community_id").eq("user_id", user.id);
    myMemberships = new Set((data ?? []).map((m) => m.community_id));
  }

  return (
    <>
      <Nav isAuthed={!!user} avatarConfig={avatarConfig} />
      <main className="mx-auto max-w-5xl px-6 py-10 pb-28 md:pb-10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">[ EXPLORE ]</p>
        <h1 className="mt-2 font-grotesk text-huge font-black uppercase">Find your weird.</h1>
        <p className="mt-3 max-w-md text-ink/70">
          Communities built around personality, habits, and the stuff nobody puts in their bio.
        </p>
        <Link
          href="/fault-frequency"
          className="mt-4 inline-block border-2 border-ink bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-paper hover:bg-crack hover:border-crack"
        >
          TAKE THE FAULT FREQUENCY TEST →
        </Link>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(communities ?? []).map((c) => (
            <CommunityCard
              key={c.id}
              community={{ ...c, member_count: counts[c.id] ?? 0, is_member: myMemberships.has(c.id) }}
              isAuthed={!!user}
            />
          ))}
        </div>
      </main>
      <MobileNav />
    </>
  );
}
