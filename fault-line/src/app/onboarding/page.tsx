import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/log-in?next=/onboarding");

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) redirect("/feed");

  const [{ data: questions }, { data: zones }] = await Promise.all([
    supabase.from("personality_questions").select("id, prompt, order_index").order("order_index"),
    supabase.from("fault_zones").select("id, slug, name, description, theme").eq("is_archived", false),
  ]);

  return (
    <OnboardingWizard
      userId={user.id}
      questions={questions ?? []}
      zones={zones ?? []}
    />
  );
}
