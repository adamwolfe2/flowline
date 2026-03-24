import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Builder | MyVSL",
  description: "Build your quiz funnel with AI in 60 seconds",
  robots: { index: false, follow: false },
};

export default function BuildLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
