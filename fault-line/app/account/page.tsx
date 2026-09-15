import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut, deleteOwnAccount } from "@/app/auth/actions";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import DeleteAccountButton from "@/components/DeleteAccountButton";

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_config, privacy_level, role, created_at")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, payment_status, expires_at")
    .eq("user_id", user.id)
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <>
      <Nav isAuthed avatarConfig={profile?.avatar_config} />
      <main className="mx-auto max-w-lg px-6 py-12 pb-28 md:pb-12">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">[ ACCOUNT ]</p>
        <h1 className="mt-2 font-grotesk text-3xl font-black">Manage your account.</h1>

        <section className="mt-8 space-y-1 border-2 border-ink p-5 font-mono text-xs uppercase">
          <Row k="Email" v={user.email ?? "—"} />
          <Row k="Handle" v={profile?.username ?? "—"} />
          <Row k="Privacy level" v={profile?.privacy_level ?? "—"} />
          <Row
            k="Plan"
            v={
              subscription
                ? `${subscription.plan.toUpperCase()}${
                    subscription.expires_at
                      ? ` — until ${new Date(subscription.expires_at).toLocaleDateString()}`
                      : " — lifetime"
                  }`
                : "FREE"
            }
          />
          <Row k="Joined" v={profile ? new Date(profile.created_at).toLocaleDateString() : "—"} />
        </section>

        <form action={signOut} className="mt-6">
          <button className="w-full border-2 border-ink bg-transparent px-4 py-3 font-mono text-xs uppercase tracking-widest text-ink hover:bg-ink hover:text-paper">
            SIGN OUT
          </button>
        </form>

        <div className="mt-10 border-t-2 border-crack pt-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-crack">DANGER ZONE</p>
          <p className="mt-2 text-sm text-ink/70">
            Deleting your account permanently removes your profile, posts, comments, and
            reactions. This can&rsquo;t be undone.
          </p>
          <DeleteAccountButton action={deleteOwnAccount} />
        </div>
      </main>
      <MobileNav />
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/10 py-2">
      <span className="text-grey">{k}</span>
      <span className="font-bold">{v}</span>
    </div>
  );
}
