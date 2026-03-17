import { Outfit } from "next/font/google";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { HeroSection } from "@/components/marketing/HeroSection";
import { LogoStrip } from "@/components/marketing/LogoStrip";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { WhySection } from "@/components/marketing/WhySection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { TemplatesSection } from "@/components/marketing/TemplatesSection";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { BottomCTA } from "@/components/marketing/BottomCTA";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export default function HomePage() {
  return (
    <div className={`${outfit.variable} bg-white`}>
      <MarketingNav />
      <HeroSection />
      <LogoStrip />
      <HowItWorks />
      <WhySection />
      <FeaturesSection />
      <TemplatesSection />
      <TestimonialsSection />
      <BottomCTA />
      <MarketingFooter />
    </div>
  );
}
