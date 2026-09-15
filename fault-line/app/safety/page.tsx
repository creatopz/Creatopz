import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import { SAFETY_RESOURCES } from "@/lib/safety";

export default async function SafetyPage() {
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
      <main className="mx-auto max-w-2xl px-6 py-16 pb-28 md:pb-16">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">[ SAFETY & SUPPORT ]</p>
        <h1 className="mt-2 font-grotesk text-4xl font-black uppercase">You&rsquo;re not alone in this.</h1>
        <p className="mt-4 text-ink/80">
          FAULT LINE is a place for honesty, not a substitute for real support. If you or someone
          you know is in crisis, please reach out to one of these free, confidential lines.
        </p>

        <ul className="mt-8 space-y-3">
          {SAFETY_RESOURCES.map((r) => (
            <li key={r.name} className="flex items-center justify-between border-2 border-ink p-4 font-mono text-sm">
              <span>
                {r.name} <span className="text-grey">— {r.region}</span>
              </span>
              <span className="font-bold">{r.contact}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12 border-t-2 border-ink pt-8">
          <h2 className="font-grotesk text-2xl font-black uppercase">How we moderate</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-ink/80">
            <li>You can report any post, comment, or user — a real human reviews every report.</li>
            <li>You can block or mute anyone, instantly and privately.</li>
            <li>Posts flagged for possible self-harm risk are queued for review, not published as ordinary content.</li>
            <li>We never publicly expose your email, real name, or payment details.</li>
            <li>Rate limits and spam detection keep the feed from being flooded.</li>
          </ul>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
