"use client";

import { motion } from "framer-motion";

interface WaterfallStep {
  stepLabel: string;
  visitors: number;
  dropoffFromPrev: number;
  retentionFromTop: number;
}

interface WaterfallChartProps {
  steps: WaterfallStep[];
}

const BRAND = "#2D6A4F";

// Semantic severity palette for drop-off (§4 color hierarchy):
// small loss = on-brand green, moderate = amber warning, large = red alert.
function dropSeverity(drop: number): { text: string; bg: string; border: string } {
  if (drop <= 10) return { text: "#2D6A4F", bg: "#2D6A4F14", border: "#2D6A4F33" };
  if (drop <= 30) return { text: "#B45309", bg: "#D9770614", border: "#D9770633" };
  return { text: "#B91C1C", bg: "#DC262614", border: "#DC262633" };
}

export function WaterfallChart({ steps }: WaterfallChartProps) {
  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        Share your funnel to start seeing drop-off data
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {steps.map((step, i) => {
        const retention = Math.max(0, Math.min(100, step.retentionFromTop));
        const dropped = i > 0 && step.dropoffFromPrev > 0;
        const sev = dropSeverity(step.dropoffFromPrev);
        return (
          <div key={`${step.stepLabel}-${i}`}>
            {/* Label + numbers */}
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <span
                className="text-xs text-gray-700 leading-snug break-words flex-1 min-w-0"
                title={step.stepLabel}
              >
                {step.stepLabel}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-500 tabular-nums whitespace-nowrap">
                  <span className="font-semibold text-gray-900">{step.visitors.toLocaleString()}</span>
                  <span className="text-gray-400"> · {retention}% kept</span>
                </span>
                {/* Drop-off % is the visual hero, color-coded by severity */}
                {dropped ? (
                  <span
                    className="text-xs font-semibold tabular-nums rounded-md px-2 py-0.5 border whitespace-nowrap"
                    style={{ color: sev.text, backgroundColor: sev.bg, borderColor: sev.border }}
                  >
                    &minus;{step.dropoffFromPrev}%
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-gray-400 rounded-md px-2 py-0.5 bg-gray-50 whitespace-nowrap">
                    start
                  </span>
                )}
              </div>
            </div>
            {/* Retention bar */}
            <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: BRAND }}
                initial={{ width: 0 }}
                animate={{ width: `${retention}%` }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
