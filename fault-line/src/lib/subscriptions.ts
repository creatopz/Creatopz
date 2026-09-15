import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { planDurationMs } from "@/lib/razorpay";
import type { SubscriptionPlan } from "@/types/database";

/**
 * Marks a subscription active given a confirmed Razorpay order + payment.
 * Idempotent: safe to call from both the client-side verify route (fast
 * path) and the webhook (source of truth) without double-crediting a user,
 * since it short-circuits once a payment_id is already recorded.
 */
export async function activateSubscriptionForOrder(orderId: string, paymentId: string) {
  const admin = createAdminClient();

  const { data: subscription, error } = await admin
    .from("subscriptions")
    .select("id, user_id, plan, status, razorpay_payment_id")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  if (error) throw error;
  if (!subscription) return { ok: false as const, reason: "unknown_order" as const };

  // duplicate payment protection — already processed this exact order
  if (subscription.status === "active" && subscription.razorpay_payment_id === paymentId) {
    return { ok: true as const, alreadyProcessed: true as const };
  }

  const now = new Date();
  const duration = planDurationMs(subscription.plan as SubscriptionPlan);
  const expiresAt = duration ? new Date(now.getTime() + duration).toISOString() : null;

  const { error: updateError } = await admin
    .from("subscriptions")
    .update({
      status: "active",
      razorpay_payment_id: paymentId,
      started_at: now.toISOString(),
      expires_at: expiresAt,
    })
    .eq("id", subscription.id);

  if (updateError) throw updateError;

  return { ok: true as const, alreadyProcessed: false as const, userId: subscription.user_id };
}
