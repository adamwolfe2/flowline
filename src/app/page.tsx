import { MarketingNav } from "@/components/marketing/MarketingNav";
import { HeroSection } from "@/components/marketing/HeroSection";
import { LogoStrip } from "@/components/marketing/LogoStrip";
import { ProductDemo } from "@/components/marketing/ProductDemo";
import { IntegrationsSection } from "@/components/marketing/IntegrationsSection";
import { WhySection } from "@/components/marketing/WhySection";
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
      <ProductDemo />
      <IntegrationsSection />
      <WhySection />
      <TemplatesSection />
      <TestimonialsSection />
      <BottomCTA />
      <MarketingFooter />
    </div>
  );
}
