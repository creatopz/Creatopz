import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MyProfileRedirect() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/profile/me");

  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
  redirect(`/profile/${profile?.username ?? ""}`);
}
