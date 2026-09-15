import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import PricingCheckout from "@/components/PricingCheckout";

const PLANS = [
  {
    key: "monthly" as const,
    name: "JUST CURIOUS",
    price: "₹1",
    period: "30 DAYS",
    note: "Basically free.",
  },
  {
    key: "yearly" as const,
    name: "STAY A WHILE",
    price: "₹12",
    period: "1 YEAR",
    note: "One rupee per month.",
    highlight: "MOST REASONABLE HUMAN DECISION",
  },
  {
    key: "lifetime" as const,
    name: "YOU LIVE HERE NOW",
    price: "₹699",
    period: "LIFETIME",
    note: "No monthly guilt.",
  },
];

export default async function PricingPage() {
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
      <main className="mx-auto max-w-5xl px-6 py-12 pb-28 md:pb-12">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">[ PRICING ]</p>
        <h1 className="mt-2 max-w-2xl font-grotesk text-huge font-black uppercase leading-none">
          The internet doesn&rsquo;t need another ₹999/month subscription.
        </h1>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.key}
              className={`flex flex-col justify-between border-2 border-ink bg-paper p-6 shadow-[6px_6px_0_#111] ${
                p.highlight ? "bg-black text-paper" : ""
              }`}
            >
              <div>
                {p.highlight && (
                  <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-acid">{p.highlight}</p>
                )}
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">{p.name}</p>
                <p className="mt-2 font-grotesk text-5xl font-black">{p.price}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest opacity-60">{p.period}</p>
                <p className="mt-4 text-sm opacity-80">{p.note}</p>
              </div>
              <div className="mt-8">
                <PricingCheckout plan={p.key} label={p.name} isAuthed={!!user} />
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-md border-2 border-dashed border-ink/40 p-6 text-center font-mono text-[11px] uppercase tracking-wide text-ink/60">
          Yes, really ₹1. No hidden ₹999 surprise. We also hate complicated pricing.
        </div>
      </main>
      <MobileNav />
    </>
  );
}
