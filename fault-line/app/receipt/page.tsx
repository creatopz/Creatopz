import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import PersonalityReceipt from "@/components/PersonalityReceipt";
import { generateReceipt } from "@/lib/receipt";

export default async function ReceiptPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/receipt");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_config")
    .eq("id", user.id)
    .single();

  const receipt = generateReceipt(user.id, profile?.username ?? "human");

  return (
    <>
      <Nav isAuthed avatarConfig={profile?.avatar_config} />
      <main className="mx-auto max-w-xl px-6 py-16 pb-28 text-center md:pb-16">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">[ HUMAN RECEIPT ]</p>
        <h1 className="mt-2 font-grotesk text-4xl font-black uppercase">Your honesty, itemized.</h1>
        <div className="mt-10">
          <PersonalityReceipt data={receipt} />
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-grey">
          Screenshot &amp; share. Your identity stays exactly as private as you set it.
        </p>
      </main>
      <MobileNav />
    </>
  );
}
