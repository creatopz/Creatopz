"use client";

import Script from "next/script";
import { useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingCheckout({
  plan,
  label,
  isAuthed,
}: {
  plan: "monthly" | "yearly" | "lifetime";
  label: string;
  isAuthed: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const start = async () => {
    if (!isAuthed) {
      router.push(`/auth/signup?next=/pricing`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error ?? "Could not start checkout.");

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "FAULT LINE",
        description: label,
        theme: { color: "#111111" },
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/subscriptions/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            router.push("/cracks?welcome=paid");
          } else {
            setError("Payment received but verification failed — contact support.");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className="w-full border-2 border-ink bg-ink px-4 py-3 font-mono text-xs uppercase tracking-widest text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-50"
      >
        {loading ? "…" : "GET THIS →"}
      </button>
      {error && <p className="mt-2 font-mono text-[10px] uppercase text-crack">{error}</p>}
    </>
  );
}
