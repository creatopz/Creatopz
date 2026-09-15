import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature, computeExpiry, PlanKey } from "@/lib/razorpay";

/**
 * Authoritative payment source of truth. Configure this URL
 * (https://yourdomain.com/api/subscriptions/webhook) in the Razorpay
 * dashboard under Settings → Webhooks, subscribed to `payment.captured`
 * and `payment.failed`, with RAZORPAY_WEBHOOK_SECRET matching the secret
 * you set there.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const admin = createAdminClient();

  const entity = event?.payload?.payment?.entity;
  if (!entity) return NextResponse.json({ ok: true }); // event type we don't care about

  const orderId: string | undefined = entity.order_id;
  const paymentId: string | undefined = entity.id;
  if (!orderId || !paymentId) return NextResponse.json({ ok: true });

  const { data: sub } = await admin
    .from("subscriptions")
    .select("*")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();
  if (!sub) return NextResponse.json({ ok: true }); // unknown order — ignore

  // Idempotency: a payment already marked paid with this exact payment id
  // is a duplicate delivery of an event we've already processed.
  if (sub.payment_status === "paid" && sub.razorpay_payment_id === paymentId) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  if (event.event === "payment.captured") {
    const startedAt = new Date().toISOString();
    await admin
      .from("subscriptions")
      .update({
        payment_status: "paid",
        razorpay_payment_id: paymentId,
        started_at: startedAt,
        expires_at: computeExpiry(sub.plan as PlanKey, new Date(startedAt)),
      })
      .eq("id", sub.id);
  } else if (event.event === "payment.failed") {
    await admin
      .from("subscriptions")
      .update({ payment_status: "failed", razorpay_payment_id: paymentId })
      .eq("id", sub.id);
  }

  return NextResponse.json({ ok: true });
}
