import { Sora, DM_Sans } from "next/font/google";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { HeroSection } from "@/components/marketing/HeroSection";
import { LogoBar } from "@/components/marketing/LogoBar";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FeatureSplitA } from "@/components/marketing/FeatureSplitA";
import { FeatureSplitB } from "@/components/marketing/FeatureSplitB";
import { PricingSection } from "@/components/marketing/PricingSection";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export default function HomePage() {
  return (
    <div className={`${sora.variable} ${dmSans.variable}`}>
      <MarketingNav />
      <HeroSection />
      <LogoBar />
      <HowItWorks />
      <FeatureSplitA />
      <FeatureSplitB />
      <PricingSection />
      <TestimonialsSection />
      <FinalCTA />
      <MarketingFooter />
    </div>
  );
}
