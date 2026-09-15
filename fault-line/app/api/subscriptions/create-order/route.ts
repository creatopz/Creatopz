import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayOrder, PLANS, PlanKey } from "@/lib/razorpay";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const plan = body?.plan as PlanKey;
  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  try {
    const receipt = `fl_${user.id.slice(0, 8)}_${Date.now()}`;
    const order = await createRazorpayOrder(plan, receipt);

    // Written with the service role: regular users have no insert policy on
    // subscriptions (see schema.sql) so this row can only be created from a
    // trusted server context, never directly from the browser.
    const admin = createAdminClient();
    const { error } = await admin.from("subscriptions").insert({
      user_id: user.id,
      plan,
      payment_status: "pending",
      razorpay_order_id: order.id,
      amount_paise: PLANS[plan].amountPaise,
    });
    if (error) throw error;

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not start checkout." },
      { status: 500 }
    );
  }
}
