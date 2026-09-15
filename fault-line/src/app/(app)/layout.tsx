import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app/AppNav";
import { DEFAULT_AVATAR_CONFIG } from "@/lib/avatar";
import type { Expression } from "@/lib/avatar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/log-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("anonymous_username, avatar_config, avatar_expression")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  return (
    <div className="min-h-screen flex flex-col">
      <AppNav
        username={profile.anonymous_username}
        avatarConfig={profile.avatar_config ?? DEFAULT_AVATAR_CONFIG}
        expression={(profile.avatar_expression as Expression) ?? "neutral"}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
