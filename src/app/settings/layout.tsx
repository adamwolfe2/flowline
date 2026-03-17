import Link from "next/link";
import { Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

export const metadata = {
  title: "Settings — MyVSL",
  description: "Manage your MyVSL account and subscription.",
  robots: { index: false, follow: false },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-gray-900">
            <Image src="/logo.png" alt="MyVSL" width={24} height={24} />
            MyVSL
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/leads" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
              Leads
            </Link>
            <Link href="/onboarding">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                New Funnel
              </Button>
            </Link>
            <UserButton />
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
