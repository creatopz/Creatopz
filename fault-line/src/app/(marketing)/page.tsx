import { Hero } from "@/components/landing/Hero";
import { ConfessionTeaser } from "@/components/landing/ConfessionTeaser";
import { LiveConfessions } from "@/components/landing/LiveConfessions";
import { MaskGrid } from "@/components/landing/MaskGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FaultZonesPreview } from "@/components/landing/FaultZonesPreview";
import { PersonalityTeaser } from "@/components/landing/PersonalityTeaser";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ConfessionTeaser />
      <LiveConfessions />
      <MaskGrid />
      <HowItWorks />
      <FaultZonesPreview />
      <PersonalityTeaser />
      <Pricing />
      <FinalCTA />
    </>
  );
}
