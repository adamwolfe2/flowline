import { MarketingNav } from "@/components/marketing/MarketingNav";
import { PricingSection } from "@/components/marketing/PricingSection";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const metadata = {
  title: "Pricing - MyVSL",
  description:
    "Simple, transparent pricing. Start free, upgrade when you need more.",
};

export default function PricingPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col" style={{ fontFamily: "var(--font-instrument-sans)" }}>
      <MarketingNav />
      <div className="flex-1 pt-8">
        <PricingSection standalone />
      </div>
      <MarketingFooter />
    </div>
  );
}
