"use client";

import { PlayCircle } from "lucide-react";

interface VideoPlayRateCardProps {
  plays: number;
  views: number;
  rate: number;
}

const BRAND = "#0A9AFF";

/**
 * Share of landing-page viewers who started a video block.
 *
 * A landing page with no video block simply never fires `video_played`, so this
 * reads 0% rather than being hidden — "nobody played it" and "there is nothing
 * to play" both surface as an honest zero with the raw counts alongside.
 */
export function VideoPlayRateCard({ plays, views, rate }: VideoPlayRateCardProps) {
  const width = Math.max(0, Math.min(100, rate));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
          <PlayCircle className="w-3.5 h-3.5 text-gray-400" />
          Played a video
        </span>
        <span className="text-xs tabular-nums shrink-0">
          <span className="font-semibold text-gray-900">{plays.toLocaleString()}</span>
          <span className="text-gray-400"> / {views.toLocaleString()} views</span>
        </span>
      </div>

      <p className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
        {rate}
        <span className="text-sm font-normal text-gray-400 ml-0.5">%</span>
      </p>

      <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${width}%`, backgroundColor: BRAND }}
        />
      </div>

      {views === 0 && (
        <p className="text-[10px] text-gray-400">
          No page views in this range yet.
        </p>
      )}
    </div>
  );
}
