import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutTemplate, Layers } from "lucide-react";

export function EmptyState({ onOpenTemplates }: { onOpenTemplates?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 bg-[#2D6A4F]/10 rounded-2xl flex items-center justify-center mb-5">
        <Layers className="w-7 h-7 text-[#2D6A4F]" />
      </div>
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
        {onOpenTemplates ? (
          <button onClick={onOpenTemplates} className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors flex items-center gap-1.5">
            <LayoutTemplate className="w-3.5 h-3.5" />
            Or start from a template
          </button>
        ) : (
          <Link href="/build" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors flex items-center gap-1.5">
            <LayoutTemplate className="w-3.5 h-3.5" />
            Or start from a template
          </Link>
        )}
      </div>
    </div>
  );
}
