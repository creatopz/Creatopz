import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayOrder, PLAN_AMOUNTS_PAISE } from "@/lib/razorpay";
import type { SubscriptionPlan } from "@/types/database";

const PLANS = Object.keys(PLAN_AMOUNTS_PAISE) as SubscriptionPlan[];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const plan: SubscriptionPlan | undefined = body?.plan;
  if (!plan || !PLANS.includes(plan)) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  const admin = createAdminClient();

  // lifetime already active? don't sell it twice.
  const { data: existingLifetime } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("plan", "lifetime")
    .eq("status", "active")
    .maybeSingle();

  if (existingLifetime) {
    return NextResponse.json({ error: "You already have lifetime access." }, { status: 409 });
  }

  const amountPaise = PLAN_AMOUNTS_PAISE[plan];
  const receipt = `fl_${user.id.slice(0, 8)}_${Date.now()}`;

  let order;
  try {
    order = await createRazorpayOrder({ amountPaise, receipt, notes: { user_id: user.id, plan } });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not start checkout." },
      { status: 502 }
    );
  }

  const { data: subscription, error: insertError } = await admin
    .from("subscriptions")
    .insert({
      user_id: user.id,
      plan,
      status: "pending",
      razorpay_order_id: order.id,
      amount_paise: amountPaise,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    subscription_id: subscription.id,
  });
}
