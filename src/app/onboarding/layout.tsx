import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started | MyVSL",
  description: "Build your first AI-powered quiz funnel in 60 seconds.",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
