import type { Metadata } from "next";
import { AppNav } from "@/components/AppNav";

export const metadata: Metadata = {
  title: "Leads | MyVSL",
  description: "View and manage all your funnel leads.",
  robots: { index: false, follow: false },
};

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <AppNav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
