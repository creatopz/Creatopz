import "server-only";
import crypto from "node:crypto";

export const PLANS = {
  monthly: { label: "JUST CURIOUS", amountPaise: 100, days: 30 },
  yearly: { label: "STAY A WHILE", amountPaise: 1200, days: 365 },
  lifetime: { label: "YOU LIVE HERE NOW", amountPaise: 69900, days: null as number | null },
} as const;

export type PlanKey = keyof typeof PLANS;

function authHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).");
  }
  return "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

/** Creates a Razorpay order server-side. Never trust an amount sent from the client. */
export async function createRazorpayOrder(plan: PlanKey, receipt: string) {
  const { amountPaise } = PLANS[plan];
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: { plan },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Razorpay order creation failed: ${body}`);
  }
  return res.json() as Promise<{ id: string; amount: number; currency: string }>;
}

/** Verifies the checkout-flow signature (order_id|payment_id signed with key secret). */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not configured.");
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return timingSafeEqual(expected, signature);
}

/** Verifies an inbound webhook's X-Razorpay-Signature header against the raw body. */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured.");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function computeExpiry(plan: PlanKey, from = new Date()): string | null {
  const { days } = PLANS[plan];
  if (days === null) return null;
  return new Date(from.getTime() + days * 86400000).toISOString();
}
