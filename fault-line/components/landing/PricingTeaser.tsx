import Link from "next/link";

const PLANS = [
  { name: "JUST CURIOUS", price: "₹1", period: "30 DAYS" },
  { name: "STAY A WHILE", price: "₹12", period: "1 YEAR", highlight: true },
  { name: "YOU LIVE HERE NOW", price: "₹699", period: "LIFETIME" },
];

export default function PricingTeaser() {
  return (
    <section className="bg-ink px-6 py-24 text-paper">
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-acid">[ PRICING ]</p>
        <h2 className="mt-3 font-grotesk text-huge font-black uppercase leading-[0.9]">
          The internet doesn&rsquo;t need
          <br />
          another ₹999/month subscription.
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`border-2 p-6 ${p.highlight ? "border-acid bg-acid text-ink" : "border-paper/30"}`}
            >
              <p className="font-mono text-[9px] uppercase tracking-widest opacity-60">{p.name}</p>
              <p className="mt-2 font-grotesk text-4xl font-black">{p.price}</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-widest opacity-60">{p.period}</p>
            </div>
          ))}
        </div>
        <Link
          href="/pricing"
          data-cursor="CLICK"
          className="mt-10 inline-block border-2 border-acid px-6 py-3 font-mono text-xs uppercase tracking-widest text-acid hover:bg-acid hover:text-ink"
        >
          SEE PRICING →
        </Link>
      </div>
    </section>
  );
}
