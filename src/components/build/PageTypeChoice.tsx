"use client";

import { Check, ListChecks, FileText } from "lucide-react";

export type BuildPageType = "quiz" | "landing";

interface PageTypeChoiceProps {
  value: BuildPageType;
  onChange: (value: BuildPageType) => void;
}

const OPTIONS: {
  type: BuildPageType;
  icon: typeof ListChecks;
  title: string;
  description: string;
}[] = [
  {
    type: "quiz",
    icon: ListChecks,
    title: "Multi-step quiz funnel",
    description: "Qualify leads with questions, score them, and route to your calendar.",
  },
  {
    type: "landing",
    icon: FileText,
    title: "Single landing page",
    description: "A one-page pitch with a booking form. No quiz questions.",
  },
];

/**
 * Page-type selector shown at the top of the AI builder's prompt phase.
 * Mirrors the card visual language of the onboarding "How do you want to
 * start?" step. Quiz is the default and preserves the original flow exactly.
 */
export function PageTypeChoice({ value, onChange }: PageTypeChoiceProps) {
  return (
    <div className="space-y-3 mb-6">
      <p className="text-sm text-[#6B7280]">What do you want to build?</p>
      {OPTIONS.map(({ type, icon: Icon, title, description }) => {
        const active = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            aria-pressed={active}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all group ${
              active
                ? "border-[#0A9AFF] bg-[#EBF5F0]"
                : "border-gray-100 hover:border-[#0A9AFF] hover:bg-[#EBF5F0]"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#EBF5F0" }}
              >
                <Icon className="w-5 h-5" style={{ color: "#0A9AFF" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
              </div>
              {active && (
                <Check className="w-4 h-4 text-[#0A9AFF] flex-shrink-0 self-center" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
