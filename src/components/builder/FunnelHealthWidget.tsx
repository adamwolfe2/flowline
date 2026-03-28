"use client";

import { useState } from "react";
import { ChevronDown, Check, Circle } from "lucide-react";
import type { FunnelHealth } from "@/lib/funnel-health";

export function FunnelHealthWidget({ health }: { health: FunnelHealth }) {
  const [expanded, setExpanded] = useState(false);

  const completed = health.checks.filter((c) => c.passed).length;
  const total = health.checks.length;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (health.score / 100) * circumference;

  return (
    <div className="border-t border-[#E5E7EB]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F9FAFB] transition-colors text-left"
      >
        {/* Circular progress */}
        <div className="relative w-10 h-10 shrink-0">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke={health.color}
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
            style={{ color: health.color }}
          >
            {health.score}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#111827]">
            Funnel Health
          </p>
          <p className="text-[10px] text-[#6B7280]">
            {completed}/{total} checks passed
          </p>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-[#9CA3AF] transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-1">
          {health.checks.map((check) => (
            <div
              key={check.id}
              className="flex items-start gap-2 py-1"
            >
              {check.passed ? (
                <Check className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-[#D1D5DB] shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <p
                  className={`text-xs ${
                    check.passed
                      ? "text-[#6B7280] line-through"
                      : "text-[#111827]"
                  }`}
                >
                  {check.label}
                </p>
                {!check.passed && (
                  <p className="text-[10px] text-[#9CA3AF]">{check.tip}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
