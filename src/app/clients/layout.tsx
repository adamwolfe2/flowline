import type { Metadata } from "next";
import { AppNav } from "@/components/AppNav";

export const metadata: Metadata = {
  title: "Clients | MyVSL",
  description: "Manage your team clients and their funnels.",
  robots: { index: false, follow: false },
};

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <AppNav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
