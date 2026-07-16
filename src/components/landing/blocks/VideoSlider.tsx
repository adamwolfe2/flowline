"use client";

import { useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LandingBlock } from "@/types";
import { VideoBlock } from "./VideoBlock";

type VideoBlockData = Extract<LandingBlock, { type: "video" }>;

interface VideoSliderProps {
  blocks: VideoBlockData[];
  funnelId: string;
  sessionId: string;
}

/**
 * Renders a run of 2+ consecutive video blocks as a horizontal, scroll-snap
 * carousel instead of a tall vertical stack. Stacked videos push the calendar
 * far below the fold; a slider keeps the page short so visitors reach the
 * booking calendar quickly. Each slide reuses VideoBlock, so per-video
 * `video_played` analytics and 16:9 sizing are preserved unchanged.
 */
export function VideoSlider({ blocks, funnelId, sessionId }: VideoSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    // Advance by roughly one slide (85% of the viewport width of the track).
    track.scrollBy({ left: track.clientWidth * 0.85 * direction, behavior: "smooth" });
  }, []);

  return (
    <section className="w-full py-6 sm:py-8">
      <div className="relative">
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide -mx-1 px-1"
        >
          {blocks.map((block) => (
            <div key={block.id} className="snap-center shrink-0 w-[86%] sm:w-[520px]">
              <VideoBlock block={block} funnelId={funnelId} sessionId={sessionId} />
            </div>
          ))}
        </div>

        {/* Desktop arrow controls. Hidden on touch/mobile where users swipe. */}
        <button
          type="button"
          aria-label="Previous video"
          onClick={() => scrollByCard(-1)}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#0A0A0A] shadow-md transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A9AFF]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next video"
          onClick={() => scrollByCard(1)}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#0A0A0A] shadow-md transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A9AFF]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
