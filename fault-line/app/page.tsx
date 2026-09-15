import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import IntroSection from "@/components/landing/IntroSection";
import CommunityTeaser from "@/components/landing/CommunityTeaser";
import PricingTeaser from "@/components/landing/PricingTeaser";
import EndingSection from "@/components/landing/EndingSection";
import Footer from "@/components/Footer";

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let avatarConfig = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("avatar_config").eq("id", user.id).single();
    avatarConfig = profile?.avatar_config;
  }

  return (
    <>
      <Nav isAuthed={!!user} avatarConfig={avatarConfig} />
      <HeroSection />
      <ProblemSection />
      <IntroSection />
      <CommunityTeaser />
      <PricingTeaser />
      <EndingSection />
      <Footer />
      <MobileNav />
    </>
  );
}
