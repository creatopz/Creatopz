import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import FaultFrequencyQuiz from "@/components/FaultFrequencyQuiz";

export default async function FaultFrequencyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let avatarConfig = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("avatar_config").eq("id", user.id).single();
    avatarConfig = profile?.avatar_config;
  }

  return (
    <>
      <Nav isAuthed={!!user} avatarConfig={avatarConfig} />
      <main className="mx-auto max-w-2xl px-6 py-10 pb-28 md:pb-10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">[ FIND YOUR FAULT FREQUENCY ]</p>
        <h1 className="mt-2 font-grotesk text-4xl font-black uppercase">A weird little test.</h1>
        <p className="mt-2 text-sm text-ink/70">Not a dating app. Not a personality-industrial-complex thing. Just — your people.</p>
        <FaultFrequencyQuiz isAuthed={!!user} />
      </main>
      <MobileNav />
    </>
  );
}
