import type { Metadata } from "next";
import { AppNav } from "@/components/AppNav";

export const metadata: Metadata = {
  title: "Billing | MyVSL",
  description: "Manage your MyVSL subscription and billing.",
  robots: { index: false, follow: false },
};

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <AppNav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
