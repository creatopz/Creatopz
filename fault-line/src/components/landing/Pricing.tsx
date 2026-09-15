"use client";

import Link from "next/link";
import { useState } from "react";
import { playSound } from "@/lib/sound";
import { cx } from "@/lib/utils";

const PLANS = [
  {
    price: "₹1",
    period: "ONE MONTH",
    tag: "TEST THE FAULT LINE",
    plan: "monthly",
    big: false,
  },
  {
    price: "₹12",
    period: "ONE YEAR",
    tag: "STAY IMPERFECT",
    plan: "yearly",
    big: true,
    badge: "MOST SENSIBLE",
  },
  {
    price: "₹699",
    period: "LIFETIME",
    tag: "YOU'RE STUCK WITH US",
    plan: "lifetime",
    big: false,
  },
];

function CoinParticles({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * 360;
        return (
          <span
            key={`${n}-${i}`}
            className="absolute left-1/2 top-1/2 w-2 h-2 bg-acid border border-ink pointer-events-none"
            style={{
              animation: "coin-burst 0.6s ease-out forwards",
              transform: `translate(-50%,-50%) rotate(${angle}deg) translateY(-6px)`,
              animationDelay: `${i * 15}ms`,
            }}
          />
        );
      })}
    </>
  );
}

export function Pricing() {
  const [burst, setBurst] = useState(0);

  return (
    <section id="pricing" className="px-5 md:px-10 py-24 md:py-32 border-t border-ink/15">
      <style>{`
        @keyframes coin-burst {
          0% { opacity: 1; transform: translate(-50%,-50%) translateY(-6px) scale(1); }
          100% { opacity: 0; transform: translate(-50%,-50%) translateY(-46px) scale(0.4); }
        }
        @keyframes coin-flip {
          0% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(180deg) scale(1.15); }
          100% { transform: rotateY(360deg) scale(1); }
        }
        .coin-flip { animation: coin-flip 0.6s ease; }
      `}</style>

      <div className="mx-auto max-w-[1600px]">
        <h2 className="font-grotesk font-black uppercase text-huge max-w-[18ch]">PAY LESS THAN YOUR DAILY TEA.</h2>

        <div className="mt-14 grid md:grid-cols-3 gap-6 md:gap-0 md:divide-x md:divide-ink/25 border-t-2 border-b-2 border-ink">
          {PLANS.map((p, idx) => (
            <div
              key={p.plan}
              className={cx(
                "relative p-8 md:p-10 flex flex-col",
                p.big && "bg-ink text-paper"
              )}
            >
              {p.badge && (
                <span className="tag-chip absolute top-6 right-6" style={{ borderColor: "#C7FF00", color: "#C7FF00" }}>
                  {p.badge}
                </span>
              )}

              <button
                type="button"
                className={cx(
                  "relative w-fit select-none text-left",
                  idx === 0 && burst > 0 && "coin-flip"
                )}
                onClick={() => {
                  if (idx === 0) {
                    setBurst((b) => b + 1);
                    playSound("reaction");
                  }
                }}
                aria-label={idx === 0 ? "₹1 coin — click it" : undefined}
              >
                <span className="font-grotesk font-black text-[4.5rem] md:text-[6rem] leading-none">{p.price}</span>
                {idx === 0 && burst > 0 && <CoinParticles n={burst} />}
              </button>

              <p className="sys text-xs mt-4 opacity-70">{p.period}</p>
              <p className="font-grotesk font-black uppercase text-xl mt-2 mb-8">{p.tag}</p>

              <Link
                href={`/pricing?plan=${p.plan}`}
                className={cx("btn mt-auto w-fit", p.big && "bg-paper text-ink border-paper")}
                onMouseEnter={() => playSound("hover")}
                onClick={() => playSound("click")}
              >
                CHOOSE {p.period} →
              </Link>
            </div>
          ))}
        </div>

        <p className="sys text-xs mt-8 max-w-[52ch] opacity-60">
          ONE SMALL PAYMENT. NO ADS FIGHTING FOR YOUR ATTENTION. NO PRESSURE TO BECOME A PRODUCT.
        </p>
      </div>
    </section>
  );
}
