"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

interface UpgradeGateProps {
  feature: string;
  plan: string;
  children: React.ReactNode;
}

export function UpgradeGate({ feature, plan, children }: UpgradeGateProps) {
  if (plan !== "free") return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Lock className="w-8 h-8 text-[#9CA3AF] mb-3" />
      <p className="text-sm font-medium text-[#111827] mb-1">
        {feature} is a Pro feature
      </p>
      <p className="text-xs text-[#6B7280] mb-4">
        Upgrade to unlock {feature.toLowerCase()}
      </p>
      <Link
        href="/billing"
        className="bg-[#2D6A4F] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#245840] transition-colors"
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}
