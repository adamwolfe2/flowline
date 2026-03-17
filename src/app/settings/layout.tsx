import Link from "next/link";
import { Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-gray-900">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            Flowline
          </Link>
          <div className="flex items-center gap-3">
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
