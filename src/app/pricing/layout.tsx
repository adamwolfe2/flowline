import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | MyVSL",
  description: "Simple, transparent pricing for MyVSL. Start free, upgrade when you need more.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
