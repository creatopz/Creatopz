"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { playSound } from "@/lib/sound";
import { cx } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types/database";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function PaymentButton({
  plan,
  label,
  isSignedIn,
  variant = "default",
}: {
  plan: SubscriptionPlan;
  label: string;
  isSignedIn: boolean;
  variant?: "default" | "inverted";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    if (!isSignedIn) {
      router.push(`/auth/log-in?next=${encodeURIComponent("/pricing")}`);
      return;
    }

    setError(null);
    setLoading(true);
    playSound("click");

    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error ?? "Could not start checkout.");

      if (!window.Razorpay) throw new Error("Payment library hasn't loaded yet — try again in a second.");

      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "FAULT LINE",
        description: label,
        order_id: order.order_id,
        theme: { color: "#111111" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            playSound("success");
            router.push("/account?activated=1");
            router.refresh();
          } else {
            playSound("error");
            setError("Payment received but activation didn't confirm yet — check /account in a minute.");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.open();
    } catch (err) {
      playSound("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={cx("btn w-full justify-center disabled:opacity-50", variant === "inverted" && "bg-paper text-ink border-paper")}
      >
        {loading ? "OPENING CHECKOUT…" : label}
      </button>
      {error && <p className="text-xs text-red mt-2">{error}</p>}
    </div>
  );
}
