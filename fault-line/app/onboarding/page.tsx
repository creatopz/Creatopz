import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import FaultLogo from "@/components/FaultLogo";

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, onboarded")
    .eq("id", user.id)
    .single();

  if (profile?.onboarded) redirect("/cracks");

  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b-2 border-ink px-6 py-4">
        <FaultLogo href={null} />
      </div>
      <OnboardingWizard initialUsername={profile?.username ?? ""} />
    </div>
  );
}
