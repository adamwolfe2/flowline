"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function FunnelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Public funnel render error", {
      error: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <h2 className="text-xl font-semibold text-[#111827] mb-2">Failed to load funnel</h2>
      <p className="text-sm text-[#6B7280] mb-6">This funnel could not be loaded. It may have been unpublished.</p>
      <button
        onClick={reset}
        className="bg-[#0A9AFF] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0883DB] transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
