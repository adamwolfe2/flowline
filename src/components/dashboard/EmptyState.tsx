"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutTemplate, Layers, MessageSquare, Sparkles, Globe } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Describe",
    description: "Tell AI about your business",
  },
  {
    icon: Sparkles,
    title: "Customize",
    description: "Edit questions and branding",
  },
  {
    icon: Globe,
    title: "Launch",
    description: "Publish and start capturing leads",
  },
];

export function EmptyState({ onOpenTemplates }: { onOpenTemplates?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-[#2D6A4F]/10 rounded-2xl flex items-center justify-center mb-5">
        <Layers className="w-7 h-7 text-[#2D6A4F]" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Build Your First Funnel</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-8">
        Describe your business and AI will create a quiz funnel in 60 seconds. No code required.
      </p>

      {/* How it works mini-guide */}
      <div className="flex items-start gap-4 sm:gap-8 mb-8 max-w-lg">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="flex-1 flex flex-col items-center text-center relative">
              {i < steps.length - 1 && (
                <div className="absolute top-5 left-[55%] w-[90%] h-px bg-[#E5E7EB] hidden sm:block" />
              )}
              <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/5 border border-[#E5E7EB] flex items-center justify-center mb-2 relative z-10">
                <Icon className="w-4 h-4 text-[#2D6A4F]" />
              </div>
              <p className="text-xs font-semibold text-[#111827]">{step.title}</p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">{step.description}</p>
            </div>
          );
        })}
      </div>

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
