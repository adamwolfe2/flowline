import type { Metadata } from "next";
import { AppNav } from "@/components/AppNav";

export const metadata: Metadata = {
  title: "Dashboard | MyVSL",
  description: "Manage your VSL funnels, view analytics, and track leads.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <AppNav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
