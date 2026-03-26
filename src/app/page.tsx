import dynamic from "next/dynamic";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { HeroSection } from "@/components/marketing/HeroSection";
import { LogoStrip } from "@/components/marketing/LogoStrip";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

const ProductDemo = dynamic(
  () => import("@/components/marketing/ProductDemo").then((m) => m.ProductDemo),
  { ssr: true }
);
const IntegrationsSection = dynamic(
  () => import("@/components/marketing/IntegrationsSection").then((m) => m.IntegrationsSection),
  { ssr: true }
);
const WhySection = dynamic(
  () => import("@/components/marketing/WhySection").then((m) => m.WhySection),
  { ssr: true }
);
const TemplatesSection = dynamic(
  () => import("@/components/marketing/TemplatesSection").then((m) => m.TemplatesSection),
  { ssr: true }
);
const TestimonialsSection = dynamic(
  () => import("@/components/marketing/TestimonialsSection").then((m) => m.TestimonialsSection),
  { ssr: true }
);
const BottomCTA = dynamic(
  () => import("@/components/marketing/BottomCTA").then((m) => m.BottomCTA),
  { ssr: true }
);

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
