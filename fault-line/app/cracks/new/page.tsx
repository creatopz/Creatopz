import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import PostComposer from "@/components/PostComposer";
import FaultLogo from "@/components/FaultLogo";

export default async function NewCrackPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/cracks/new");

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_config, onboarded")
    .eq("id", user.id)
    .single();
  if (!profile?.onboarded) redirect("/onboarding");

  return (
    <>
      <Nav isAuthed avatarConfig={profile.avatar_config} />
      <div className="border-b-2 border-ink px-6 py-4 md:hidden">
        <FaultLogo size="sm" />
      </div>
      <main className="mx-auto max-w-2xl px-6 py-10 pb-28 md:pb-10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">[ NEW ENTRY ]</p>
        <h1 className="mt-2 font-grotesk text-4xl font-black uppercase">Drop it.</h1>
        <div className="mt-6">
          <PostComposer />
        </div>
      </main>
      <MobileNav />
    </>
  );
}
