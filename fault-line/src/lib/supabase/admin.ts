import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role Supabase client. NEVER import this from a Client Component
 * or expose it to the browser — it bypasses Row Level Security entirely.
 * Reserved for: admin API routes (after verifying the caller is an admin),
 * the Razorpay webhook handler, and moderation actions. The `server-only`
 * import above makes any accidental client-side import fail the build.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
