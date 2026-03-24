import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started | MyVSL",
  description: "Create your first AI-powered quiz funnel.",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
