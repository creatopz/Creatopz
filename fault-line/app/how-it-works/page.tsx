import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import Link from "next/link";

const STEPS = [
  { n: "01", title: "BUILD YOUR HUMAN", body: "No photo upload. Pick a pixel face, a mood, and a vibe. That's your whole identity here." },
  { n: "02", title: "DROP A CRACK", body: "Answer a rotating prompt about what you're actually feeling. Post it public, in a community, or fully anonymous." },
  { n: "03", title: "GET REACTED TO", body: "No likes. People respond with SAME HERE, I FEEL THIS, YOU'RE NOT ALONE — real acknowledgment, not a popularity count." },
  { n: "04", title: "FIND YOUR WEIRD", body: "Join communities built around the specific way you're a mess, or take the Fault Frequency test to get matched." },
];

export default async function HowItWorksPage() {
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
      <main className="mx-auto max-w-3xl px-6 py-16 pb-28 md:pb-16">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">[ HOW IT WORKS ]</p>
        <h1 className="mt-2 font-grotesk text-huge font-black uppercase leading-[0.9]">
          No followers.
          <br />
          No highlight reel.
        </h1>
        <div className="mt-14 space-y-10">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-6 border-b-2 border-ink pb-8">
              <span className="font-mono text-2xl font-black text-crack">{s.n}</span>
              <div>
                <h2 className="font-grotesk text-xl font-black uppercase">{s.title}</h2>
                <p className="mt-1 text-ink/70">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/auth/signup"
          className="mt-8 inline-block border-2 border-ink bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-crack hover:border-crack"
        >
          ENTER THE FAULT →
        </Link>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
