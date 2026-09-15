import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaymentSignature, computeExpiry, PlanKey } from "@/lib/razorpay";

/**
 * Called by the client immediately after Razorpay Checkout reports success.
 * This is a UX fast-path only — it verifies the cryptographic signature
 * before touching the database, and the webhook route below is the
 * authoritative source of truth in case this call never arrives (closed
 * tab, network drop, etc).
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment fields." }, { status: 400 });
  }

  const valid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!valid) {
    return NextResponse.json({ error: "Signature verification failed." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: sub, error: fetchError } = await admin
    .from("subscriptions")
    .select("*")
    .eq("razorpay_order_id", razorpay_order_id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !sub) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (sub.payment_status === "paid") {
    return NextResponse.json({ ok: true, already: true });
  }

  const startedAt = new Date().toISOString();
  const { error } = await admin
    .from("subscriptions")
    .update({
      payment_status: "paid",
      razorpay_payment_id,
      started_at: startedAt,
      expires_at: computeExpiry(sub.plan as PlanKey, new Date(startedAt)),
    })
    .eq("id", sub.id);

  if (error) return NextResponse.json({ error: "Could not confirm payment." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
