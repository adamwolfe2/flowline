"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function PreviewFunnelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Funnel preview render error", {
      error: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <h2 className="text-xl font-semibold text-[#111827] mb-2">Preview failed to load</h2>
      <p className="text-sm text-[#6B7280] mb-6">This preview could not be rendered. Try saving your funnel and reopening the preview.</p>
      <button
        onClick={reset}
        className="bg-[#2D6A4F] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#245840] transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
