import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { activateSubscriptionForOrder } from "@/lib/subscriptions";

/**
 * Razorpay webhook — the source of truth for subscription activation.
 * Configure this URL (https://yourdomain.com/api/payments/webhook) in the
 * Razorpay dashboard, subscribed to `payment.captured`, with
 * RAZORPAY_WEBHOOK_SECRET matching what you set there.
 *
 * Reads the raw body (not request.json()) because signature verification
 * is over the exact byte string Razorpay sent — parsing first would let a
 * re-serialized body silently diverge from what was signed.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let valid: boolean;
  try {
    valid = verifyWebhookSignature(rawBody, signature);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Verification error." }, { status: 500 });
  }

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event as string;

  if (event === "payment.captured" || event === "order.paid") {
    const entity = payload.payload?.payment?.entity;
    const orderId: string | undefined = entity?.order_id;
    const paymentId: string | undefined = entity?.id;

    if (orderId && paymentId) {
      try {
        await activateSubscriptionForOrder(orderId, paymentId);
      } catch (err) {
        // still 200 back to Razorpay to avoid endless retries on our own
        // data bug, but log loudly — this needs a human look.
        console.error("[razorpay webhook] failed to activate subscription", err);
      }
    }
  }

  // payment.failed and everything else: no state change needed, `pending`
  // subscriptions simply age out and are never marked active.
  return NextResponse.json({ received: true });
}
