import Script from "next/script";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PaymentButton } from "@/components/pricing/PaymentButton";

export const metadata: Metadata = { title: "Pricing" };

const PLANS = [
  { plan: "monthly" as const, price: "₹1", period: "ONE MONTH", tag: "TEST THE FAULT LINE" },
  { plan: "yearly" as const, price: "₹12", period: "ONE YEAR", tag: "STAY IMPERFECT", badge: "MOST SENSIBLE", big: true },
  { plan: "lifetime" as const, price: "₹699", period: "LIFETIME", tag: "YOU'RE STUCK WITH US" },
];

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="px-5 md:px-10 py-16 md:py-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="mx-auto max-w-[1600px]">
        <h1 className="font-grotesk font-black uppercase text-huge max-w-[18ch] mb-14">
          PAY LESS THAN YOUR DAILY TEA.
        </h1>

        <div className="grid md:grid-cols-3 gap-6 md:gap-0 md:divide-x md:divide-ink/25 border-t-2 border-b-2 border-ink">
          {PLANS.map((p) => (
            <div key={p.plan} className={`relative p-8 md:p-10 flex flex-col ${p.big ? "bg-ink text-paper" : ""}`}>
              {p.badge && (
                <span className="tag-chip absolute top-6 right-6" style={{ borderColor: "#C7FF00", color: "#C7FF00" }}>
                  {p.badge}
                </span>
              )}
              <span className="font-grotesk font-black text-[4rem] md:text-[5.5rem] leading-none">{p.price}</span>
              <p className="sys text-xs mt-4 opacity-70">{p.period}</p>
              <p className="font-grotesk font-black uppercase text-xl mt-2 mb-8">{p.tag}</p>
              <div className="mt-auto">
                <PaymentButton plan={p.plan} label={`CHOOSE ${p.period} →`} isSignedIn={!!user} variant={p.big ? "inverted" : "default"} />
              </div>
            </div>
          ))}
        </div>

        <p className="sys text-xs mt-8 max-w-[52ch] opacity-60">
          ONE SMALL PAYMENT. NO ADS FIGHTING FOR YOUR ATTENTION. NO PRESSURE TO BECOME A PRODUCT. PAYMENTS ARE
          VERIFIED SERVER-SIDE VIA RAZORPAY — YOUR CARD DETAILS NEVER TOUCH OUR SERVERS.
        </p>
      </div>
    </div>
  );
}
