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

export function WaterfallChart({ steps }: WaterfallChartProps) {
  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        Share your funnel to start seeing drop-off data
      </div>
    );
  }

  return (
    <div className="w-full space-y-2.5">
      {steps.map((step, i) => {
        const retention = Math.max(0, Math.min(100, step.retentionFromTop));
        const dropped = i > 0 && step.dropoffFromPrev > 0;
        return (
          <div key={`${step.stepLabel}-${i}`} className="group">
            {/* Label row */}
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span
                className="text-xs text-gray-700 truncate"
                title={step.stepLabel}
              >
                {step.stepLabel}
              </span>
              <div className="flex items-baseline gap-2 shrink-0 tabular-nums">
                <span className="text-xs font-semibold text-gray-900">
                  {step.visitors.toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-400 w-9 text-right">
                  {retention}%
                </span>
                {dropped ? (
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-50 rounded px-1.5 py-0.5 w-12 text-center">
                    &minus;{step.dropoffFromPrev}%
                  </span>
                ) : (
                  <span className="w-12" />
                )}
              </div>
            </div>
            {/* Bar */}
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
