"use client";

import { motion } from "framer-motion";
import { FunnelConfig } from "@/types";

interface ProgressBarProps {
  config: FunnelConfig;
  step: number;
  totalQuestions: number;
}

export function ProgressBar({ config, step, totalQuestions }: ProgressBarProps) {
  const questionProgress = step >= 1 && step <= totalQuestions ? step : step > totalQuestions ? totalQuestions : 0;
  const visible = step >= 1 && step <= totalQuestions + 1;

  if (!visible) return null;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 font-medium">
          {step <= totalQuestions ? `Question ${step} of ${totalQuestions}` : "Almost done"}
        </span>
        <span className="text-xs text-gray-400 font-medium">
          {Math.round((questionProgress / totalQuestions) * 100)}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-1.5 rounded-full"
          style={{ backgroundColor: config.brand.primaryColor }}
          animate={{ width: `${(questionProgress / totalQuestions) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
