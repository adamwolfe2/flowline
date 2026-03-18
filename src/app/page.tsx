import { Lora } from "next/font/google";
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

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export default function HomePage() {
  return (
    <div className={`${lora.variable} bg-white`}>
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
