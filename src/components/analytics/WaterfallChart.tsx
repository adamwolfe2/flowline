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

export function WaterfallChart({ steps }: WaterfallChartProps) {
  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">
        Share your funnel to start seeing drop-off data
      </div>
    );
  }

  const maxVisitors = Math.max(...steps.map((s) => s.visitors), 1);
  const chartHeight = 240;

  return (
    <div className="w-full">
      <div className="relative" style={{ height: chartHeight + 60 }}>
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${steps.length * 100} ${chartHeight}`} preserveAspectRatio="none">
          {steps.map((step, i) => {
            const barHeight = (step.visitors / maxVisitors) * (chartHeight - 20);
            const x = i * 100 + 15;
            const y = chartHeight - barHeight;

            return (
              <g key={step.stepLabel}>
                {/* Drop-off zone */}
                {i > 0 && step.dropoffFromPrev > 0 && (
                  <rect
                    x={x - 15}
                    y={y}
                    width={15}
                    height={barHeight}
                    fill="#FEE2E2"
                    opacity={0.5}
                  />
                )}
                {/* Main bar */}
                <motion.rect
                  x={x}
                  y={chartHeight}
                  width={70}
                  height={0}
                  rx={4}
                  fill="#2D6A4F"
                  animate={{ y, height: barHeight }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                />
                {/* Retention % above bar */}
                <text x={x + 35} y={y - 6} textAnchor="middle" className="text-[10px]" fill="#2D6A4F" fontWeight={600}>
                  {step.retentionFromTop}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Labels below */}
        <div className="flex justify-between px-2 mt-2">
          {steps.map((step, i) => (
            <div key={i} className="text-center flex-1">
              <p className="text-xs font-medium text-gray-900">{step.visitors.toLocaleString()}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{step.stepLabel}</p>
              {step.dropoffFromPrev > 0 && i > 0 && (
                <p className="text-[10px] text-red-500 mt-0.5">-{step.dropoffFromPrev}%</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
