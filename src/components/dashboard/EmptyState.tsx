import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutTemplate } from "lucide-react";
import Image from "next/image";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Image src="/logo.png" alt="MyVSL" width={32} height={32} className="mb-6" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Build Your First Funnel</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        Describe your business and AI will create a quiz funnel in 60 seconds. No code required.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link href="/build">
          <Button className="gap-2 bg-[#2D6A4F] hover:bg-[#245840] text-white px-6 py-2.5 text-base">
            Build Your First Funnel
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/dashboard" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors flex items-center gap-1.5">
          <LayoutTemplate className="w-3.5 h-3.5" />
          Or start from a template
        </Link>
      </div>
    </div>
  );
}
