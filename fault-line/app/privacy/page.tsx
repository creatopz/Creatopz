import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function PrivacyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Nav isAuthed={!!user} />
      <main className="mx-auto max-w-2xl px-6 py-16 pb-28 md:pb-16">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">[ PRIVACY ]</p>
        <h1 className="mt-2 font-grotesk text-4xl font-black uppercase">What we do (and don&rsquo;t) collect.</h1>
        <div className="prose-sm mt-6 space-y-4 text-sm leading-relaxed text-ink/80">
          <p>
            FAULT LINE is built around not needing your real identity. We store your email (for
            login), your chosen pixel avatar and handle, whatever you post or comment, your
            reactions, community memberships, and — only if you complete it — your Fault
            Frequency quiz answers.
          </p>
          <p>
            We do not require a real name or photo. We do not sell your data. We do not show
            follower counts or engagement metrics designed to keep you scrolling.
          </p>
          <p>
            Payment is processed by Razorpay; we store only the plan, payment status, and
            Razorpay&rsquo;s order/payment IDs — never your card details, which never touch our
            servers.
          </p>
          <p>
            You can delete your account at any time from Account settings. Deletion permanently
            removes your profile, posts, comments, and reactions.
          </p>
          <p>
            Reports you file, and posts flagged for safety review, are visible to our
            moderation team only.
          </p>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
