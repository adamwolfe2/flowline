import { MarketingNav } from "@/components/marketing/MarketingNav";
import { HeroSection } from "@/components/marketing/HeroSection";
import { LogoStrip } from "@/components/marketing/LogoStrip";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { WhySection } from "@/components/marketing/WhySection";
import { ProductDemo } from "@/components/marketing/ProductDemo";
import { TemplatesSection } from "@/components/marketing/TemplatesSection";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { BottomCTA } from "@/components/marketing/BottomCTA";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function HomePage() {
  return (
    <div className="bg-white" style={{ fontFamily: "var(--font-instrument-sans)" }}>
      <MarketingNav />
      <HeroSection />
      <LogoStrip />
      <HowItWorks />
      <ProductDemo />
      <WhySection />
      <TemplatesSection />
      <TestimonialsSection />
      <BottomCTA />
      <MarketingFooter />
    </div>
  );
}
