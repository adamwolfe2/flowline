"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface TrialBannerProps {
  trialEndsAt: Date;
}

export function TrialBanner({ trialEndsAt }: TrialBannerProps) {
  const now = new Date();
  const msRemaining = trialEndsAt.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0 || daysRemaining > 14) {
    return null;
  }

  const dayLabel = daysRemaining === 1 ? "1 day" : `${daysRemaining} days`;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>
            Your Pro trial ends in <strong>{dayLabel}</strong>.
          </span>
        </div>
        <Link
          href="/billing"
          className="text-xs font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900 shrink-0"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}
