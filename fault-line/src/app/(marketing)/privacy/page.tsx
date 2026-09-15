import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="px-5 md:px-10 py-16 md:py-24">
      <div className="mx-auto max-w-[720px]">
        <p className="sys text-xs opacity-60 mb-3">HOW THIS WORKS</p>
        <h1 className="font-grotesk font-black uppercase text-huge mb-10">PRIVACY, PLAINLY.</h1>

        <div className="flex flex-col gap-8 text-[15px] leading-relaxed opacity-90">
          <p>
            Your email and password are used only to authenticate you. They are stored by Supabase Auth, never
            shown on any public page, never included in any API response the rest of the app can read, and never
            sold or shared with anyone.
          </p>
          <p>
            Everything public — your username, your pixel avatar, your posts, your reactions — is intentionally
            disconnected from your real identity. There is no field anywhere in the public data model for your real
            name, and no way to derive it from what you post here.
          </p>
          <p>
            Your answers to the personality-matching questions are private by default: only you (and, if strictly
            necessary for safety review, a moderator) can read them. They are never shown on your profile.
          </p>
          <p>
            Payments are processed by Razorpay. We never see or store your card number, UPI PIN, or bank details —
            only the plan you bought and whether the payment succeeded.
          </p>
          <p>
            We keep enough data to run moderation and prevent abuse (report records, rate-limit counters), and admin
            actions are logged for accountability. Row Level Security is enforced at the database level, not just
            hidden in the interface, so even a bug in the app code can&apos;t leak another user&apos;s private data.
          </p>
          <p>
            Want your account gone? Contact us and we&apos;ll delete your account and everything tied to it.
          </p>
        </div>
      </div>
    </div>
  );
}
