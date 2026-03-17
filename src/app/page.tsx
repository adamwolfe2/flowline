"use client";

import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { StatsBar } from "@/components/landing/StatsBar";
import { CtaSection } from "@/components/landing/CtaSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <InteractiveDemo />
      <FeaturesGrid />
      <StatsBar />
      <CtaSection />
      <Footer />
    </div>
  );
}
