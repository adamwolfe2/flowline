"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Circle, ChevronDown, X, Sparkles, Palette, Globe, Users, ArrowRight } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  href: string;
  ctaLabel: string;
}

interface OnboardingChecklistProps {
  hasFunnel: boolean;
  hasPublished: boolean;
  hasLead: boolean;
  hasCustomBrand: boolean;
  hasCalendar: boolean;
}

export function OnboardingChecklist({
  hasFunnel,
  hasPublished,
  hasLead,
  hasCustomBrand,
  hasCalendar,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("myvsl_onboarding_dismissed") === "true";
    }
    return false;
  });
  const [collapsed, setCollapsed] = useState(false);

  const items: ChecklistItem[] = [
    {
      id: "create",
      label: "Create your first funnel",
      description: "Use AI to generate a quiz funnel in seconds",
      icon: Sparkles,
      completed: hasFunnel,
      href: "/build",
      ctaLabel: "Build now",
    },
    {
      id: "brand",
      label: "Customize your branding",
      description: "Upload your logo and set brand colors",
      icon: Palette,
      completed: hasCustomBrand,
      href: "/dashboard",
      ctaLabel: "Edit brand",
    },
    {
      id: "calendar",
      label: "Connect a calendar",
      description: "Route qualified leads to your booking page",
      icon: Users,
      completed: hasCalendar,
      href: "/dashboard",
      ctaLabel: "Add calendar",
    },
    {
      id: "publish",
      label: "Publish your funnel",
      description: "Go live and share your funnel link",
      icon: Globe,
      completed: hasPublished,
      href: "/dashboard",
      ctaLabel: "Publish",
    },
    {
      id: "lead",
      label: "Capture your first lead",
      description: "Share your funnel and get your first submission",
      icon: Users,
      completed: hasLead,
      href: "/leads",
      ctaLabel: "View leads",
    },
  ];

  const completedCount = items.filter((i) => i.completed).length;
  const allDone = completedCount === items.length;

  if (dismissed || allDone) return null;

  const progressPct = Math.round((completedCount / items.length) * 100);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#111827]">
              Get started with MyVSL
            </p>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {completedCount}/{items.length} completed
            </p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#9CA3AF] transition-transform ${
              collapsed ? "" : "rotate-180"
            }`}
          />
        </button>
        <button
          onClick={() => {
            setDismissed(true);
            localStorage.setItem("myvsl_onboarding_dismissed", "true");
          }}
          className="ml-3 p-1 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          aria-label="Dismiss checklist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-3">
        <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2D6A4F] rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      {!collapsed && (
        <div className="px-5 pb-4 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors ${
                  item.completed ? "opacity-60" : "hover:bg-[#F9FAFB]"
                }`}
              >
                {item.completed ? (
                  <div className="w-5 h-5 rounded-full bg-[#2D6A4F] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-[#D1D5DB] shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      item.completed
                        ? "text-[#6B7280] line-through"
                        : "text-[#111827] font-medium"
                    }`}
                  >
                    {item.label}
                  </p>
                  {!item.completed && (
                    <p className="text-xs text-[#9CA3AF]">{item.description}</p>
                  )}
                </div>
                {!item.completed && (
                  <Link
                    href={item.href}
                    className="text-xs font-medium text-[#2D6A4F] hover:underline flex items-center gap-1 shrink-0"
                  >
                    {item.ctaLabel}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
