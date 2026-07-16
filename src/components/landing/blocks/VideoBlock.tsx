"use client";

import { useCallback, useEffect, useRef } from "react";
import type { LandingBlock } from "@/types";
import { getVideoEmbedUrl } from "@/lib/video";
import { safeHttpUrl } from "./url";

type VideoBlockData = Extract<LandingBlock, { type: "video" }>;

interface VideoBlockProps {
  block: VideoBlockData;
  funnelId: string;
  sessionId: string;
}

/**
 * Applies the block's autoplay preference to an embed URL produced by
 * `getVideoEmbedUrl`, which always hardcodes autoplay ON.
 *
 * Providers disagree on the param value style (YouTube/Vimeo/Loom use 1/0,
 * Wistia uses true/false), so the existing value is inspected rather than
 * assumed. Autoplay also implies muted: every modern browser blocks unmuted
 * autoplay outright, so an unmuted "autoplay" video would simply never start.
 */
function applyAutoplay(embedUrl: string, autoplay: boolean): string {
  try {
    const parsed = new URL(embedUrl);

    for (const key of Array.from(parsed.searchParams.keys())) {
      if (key.toLowerCase() !== "autoplay") continue;
      const current = parsed.searchParams.get(key) ?? "";
      const usesBooleanStyle = current === "true" || current === "false";
      if (autoplay) {
        parsed.searchParams.set(key, usesBooleanStyle ? "true" : "1");
      } else {
        parsed.searchParams.set(key, usesBooleanStyle ? "false" : "0");
      }
    }

    if (autoplay) {
      const host = parsed.hostname.toLowerCase();
      if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
        parsed.searchParams.set("mute", "1");
      } else if (host.endsWith("vimeo.com")) {
        parsed.searchParams.set("muted", "1");
      }
    }

    return parsed.toString();
  } catch {
    return embedUrl;
  }
}

export function VideoBlock({ block, funnelId, sessionId }: VideoBlockProps) {
  const { provider, url, autoplay } = block.props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasFiredRef = useRef(false);

  // Vidalytics has no entry in getVideoEmbedUrl (which covers youtube/vimeo/
  // loom/wistia). Its share URL is already an embed URL, so it is iframed
  // directly after an http(s) check; every other provider is delegated.
  const embedUrl =
    provider === "vidalytics" ? safeHttpUrl(url) : getVideoEmbedUrl(url);
  const finalUrl = embedUrl ? applyAutoplay(embedUrl, autoplay) : null;

  /**
   * Fires `video_played` at most once for this block.
   *
   * Real playback is unobservable here: each provider's iframe is cross-origin
   * and we do not load their JS SDKs. So the event is fired on the closest
   * honest proxy for "playback started" — the block scrolling into view when
   * autoplay is on, or the first pointer press on the player when it is off.
   * It is a play-intent signal, not a confirmed play.
   */
  const fireVideoPlayed = useCallback(() => {
    if (hasFiredRef.current) return;
    hasFiredRef.current = true;

    const payload = {
      sessionId,
      funnelId,
      eventType: "video_played",
      stepIndex: 0,
      stepKey: "landing",
      blockId: block.id,
    };

    // Best-effort analytics: a blocked/failed beacon must never surface to the
    // visitor or interrupt playback, so the rejection is intentionally dropped.
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/events",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
      return;
    }
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* intentionally ignored — see comment above */
    });
  }, [block.id, funnelId, sessionId]);

  // Autoplay path: the video starts when it enters the viewport.
  useEffect(() => {
    if (!autoplay || !finalUrl) return;
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      fireVideoPlayed();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          fireVideoPlayed();
          observer.disconnect();
          return;
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [autoplay, finalUrl, fireVideoPlayed]);

  // Manual path: first press anywhere on the player is the play click.
  const handlePointerDown = useCallback(() => {
    if (autoplay) return;
    fireVideoPlayed();
  }, [autoplay, fireVideoPlayed]);

  return (
    <section id={block.id} className="w-full py-6 sm:py-8">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className="overflow-hidden rounded-2xl border border-[#E5E7EB] shadow-sm"
      >
        {finalUrl ? (
          // 56.25% padding-top === a 16:9 box that scales to any width.
          <div className="relative" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={finalUrl}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              loading="lazy"
              title="Video"
            />
          </div>
        ) : (
          <p className="p-6 text-center text-sm text-[#9CA3AF]">Video unavailable.</p>
        )}
      </div>
    </section>
  );
}
