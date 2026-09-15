import "server-only";
import crypto from "node:crypto";
import type { SubscriptionPlan } from "@/types/database";

export const PLAN_AMOUNTS_PAISE: Record<SubscriptionPlan, number> = {
  monthly: 100, // ₹1
  yearly: 1200, // ₹12
  lifetime: 69900, // ₹699
};

export function planDurationMs(plan: SubscriptionPlan): number | null {
  if (plan === "monthly") return 30 * 24 * 60 * 60 * 1000;
  if (plan === "yearly") return 365 * 24 * 60 * 60 * 1000;
  return null; // lifetime never expires
}

function authHeader() {
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key || !secret) throw new Error("Razorpay keys are not configured on the server.");
  return "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
}

/** Creates a Razorpay order server-side. Never trust an order id the client claims to have made. */
export async function createRazorpayOrder(opts: { amountPaise: number; receipt: string; notes?: Record<string, string> }) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: opts.amountPaise,
      currency: "INR",
      receipt: opts.receipt,
      notes: opts.notes ?? {},
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Razorpay order creation failed: ${res.status} ${body}`);
  }

  return (await res.json()) as { id: string; amount: number; currency: string; status: string };
}

/** Verifies the signature Razorpay Checkout hands back to the client after a successful payment. */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("Razorpay secret is not configured on the server.");
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return timingSafeEqual(expected, signature);
}

/** Verifies the signature on an incoming Razorpay webhook payload. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("Razorpay webhook secret is not configured on the server.");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
