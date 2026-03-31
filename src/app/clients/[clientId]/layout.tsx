import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Details | MyVSL",
  description: "View and manage a client and their funnels.",
  robots: { index: false, follow: false },
};

export default function ClientDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
