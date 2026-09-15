import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import DailyCrackFlow from "@/components/DailyCrackFlow";
import { dailyCrackPrompt } from "@/lib/prompts";

export default async function DailyCrackPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/daily-crack");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_config")
    .eq("id", user.id)
    .single();

  return (
    <>
      <Nav isAuthed avatarConfig={profile?.avatar_config} />
      <main className="mx-auto max-w-xl px-6 py-16 pb-28 md:pb-16">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">[ DAILY CRACK ]</p>
        <h1 className="mt-2 font-grotesk text-4xl font-black uppercase">Today&rsquo;s question.</h1>
        <DailyCrackFlow
          prompt={dailyCrackPrompt()}
          username={profile?.username ?? "human"}
          avatarConfig={profile?.avatar_config}
        />
      </main>
      <MobileNav />
    </>
  );
}
