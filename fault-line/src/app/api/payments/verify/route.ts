import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyCheckoutSignature } from "@/lib/razorpay";
import { activateSubscriptionForOrder } from "@/lib/subscriptions";

/**
 * Fast-path confirmation called by the client right after Razorpay Checkout
 * reports success. This is a convenience so the UI can update immediately —
 * it is NOT the sole source of truth. The webhook (see /api/payments/webhook)
 * activates the same subscription independently and idempotently, so a user
 * who closes the tab before this call still gets credited.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment fields." }, { status: 400 });
  }

  let validSignature: boolean;
  try {
    validSignature = verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Verification failed." }, { status: 500 });
  }

  if (!validSignature) {
    return NextResponse.json({ error: "Payment signature did not match. Not activating." }, { status: 400 });
  }

  try {
    const result = await activateSubscriptionForOrder(razorpay_order_id, razorpay_payment_id);
    if (!result.ok) return NextResponse.json({ error: "Unknown order." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not activate subscription." }, { status: 500 });
  }
}
