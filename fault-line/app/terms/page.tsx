import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function TermsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Nav isAuthed={!!user} />
      <main className="mx-auto max-w-2xl px-6 py-16 pb-28 md:pb-16">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">[ TERMS ]</p>
        <h1 className="mt-2 font-grotesk text-4xl font-black uppercase">The short version.</h1>
        <div className="prose-sm mt-6 space-y-4 text-sm leading-relaxed text-ink/80">
          <p>Be honest about yourself. Don&rsquo;t use this place as a weapon against anyone else.</p>
          <p>
            No harassment, targeted abuse, hate speech, doxxing, or content that endangers a
            real person. We remove it and can suspend or delete accounts that post it.
          </p>
          <p>
            Payments (₹1 monthly, ₹12 yearly, ₹699 lifetime) are processed by Razorpay and
            verified server-side before access is granted. Subscriptions are non-recurring —
            you choose to renew, we never auto-charge you again.
          </p>
          <p>You own what you post. We only use it to run the platform, never to sell to advertisers.</p>
          <p>
            This is a place for honesty, not a crisis service. If you&rsquo;re in danger, see our{" "}
            <a href="/safety" className="underline">
              Safety page
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
