import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AvatarRenderer } from "@/components/avatar/AvatarRenderer";
import { DEFAULT_AVATAR_CONFIG, type Expression } from "@/lib/avatar";

const PLAN_LABEL: Record<string, string> = { monthly: "MONTHLY", yearly: "YEARLY", lifetime: "LIFETIME" };
const STATUS_LABEL: Record<string, string> = {
  active: "ACTIVE",
  pending: "AWAITING PAYMENT",
  expired: "EXPIRED",
  cancelled: "CANCELLED",
  failed: "FAILED",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: subscriptions }] = await Promise.all([
    supabase.from("profiles").select("anonymous_username, avatar_config, avatar_expression, bio, created_at").eq("id", user.id).single(),
    supabase.from("subscriptions").select("id, plan, status, started_at, expires_at, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const active = subscriptions?.find((s) => s.status === "active");

  return (
    <div className="mx-auto max-w-[720px] px-5 md:px-8 py-12">
      <p className="sys text-xs opacity-60 mb-2">ACCOUNT</p>
      <h1 className="font-grotesk font-black uppercase text-3xl md:text-4xl mb-8">YOUR FAULT LINE.</h1>

      {profile && (
        <div className="flex items-center gap-4 border border-ink p-5 mb-10">
          <AvatarRenderer
            config={profile.avatar_config ?? DEFAULT_AVATAR_CONFIG}
            expression={(profile.avatar_expression as Expression) ?? "neutral"}
            size={72}
          />
          <div>
            <p className="font-mono text-lg">{profile.anonymous_username}</p>
            <p className="sys text-[10px] opacity-50">MEMBER SINCE {new Date(profile.created_at).toLocaleDateString("en-IN")}</p>
          </div>
        </div>
      )}

      <section className="border border-ink p-6 mb-10">
        <h2 className="font-grotesk font-black uppercase text-xl mb-4">SUBSCRIPTION</h2>
        {active ? (
          <div>
            <p className="sys text-sm">
              PLAN: <span className="text-red">{PLAN_LABEL[active.plan]}</span>
            </p>
            <p className="sys text-sm mt-1">
              STATUS: <span style={{ color: "#245CFF" }}>{STATUS_LABEL[active.status]}</span>
            </p>
            <p className="sys text-sm mt-1">
              {active.expires_at ? `RENEWS/EXPIRES: ${new Date(active.expires_at).toLocaleDateString("en-IN")}` : "NEVER EXPIRES."}
            </p>
          </div>
        ) : (
          <div>
            <p className="opacity-70 mb-4">No active plan yet. Fault Line stays free to read — a plan unlocks posting without limits and supports the place directly.</p>
            <Link href="/pricing" className="btn">
              SEE PLANS →
            </Link>
          </div>
        )}

        {subscriptions && subscriptions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-ink/15">
            <p className="field-label">History</p>
            <ul className="flex flex-col gap-1">
              {subscriptions.map((s) => (
                <li key={s.id} className="sys text-[11px] opacity-60 flex justify-between">
                  <span>
                    {PLAN_LABEL[s.plan]} · {STATUS_LABEL[s.status]}
                  </span>
                  <span>{new Date(s.created_at).toLocaleDateString("en-IN")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <form action="/auth/sign-out" method="post">
        <button type="submit" className="btn btn-outline">
          SIGN OUT
        </button>
      </form>
    </div>
  );
}
