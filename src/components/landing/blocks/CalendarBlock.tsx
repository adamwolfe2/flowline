"use client";

import { useEffect, useMemo, useState } from "react";
import type { LandingBlock, TrackingConfig } from "@/types";
import { useLandingInteractive } from "../LandingInteractive";
import { useBookingConfirmed } from "../useBookingConfirmed";
import { calNamespaceFor, extractCalLink, isCalDotComUrl, safeHttpUrl } from "./url";

type CalendarBlockData = Extract<LandingBlock, { type: "calendar" }>;

interface CalendarBlockProps {
  block: CalendarBlockData;
  /** Brand primary colour, passed as a value because the Cal.com embed JS
   *  needs a real colour string (a CSS var would be sent literally). */
  brandColor: string;
  /**
   * True when a BookingFormBlock targets this block via
   * successMode: 'show_calendar'. Gated blocks stay hidden until the form
   * succeeds, which also defers the Cal.com script load until it is needed.
   */
  gated?: boolean;
  funnelId: string;
  sessionId: string;
  /** Ad pixels to fire on a confirmed booking. */
  tracking?: TrackingConfig;
}

// Mirrors the global declared in funnel/SuccessStep.tsx.
declare global {
  interface Window {
    Cal?: ((...args: unknown[]) => void) & {
      ns: Record<string, (...args: unknown[]) => void>;
    };
  }
}

const MOBILE_BREAKPOINT_PX = 600;
const EMBED_TIMEOUT_MS = 10_000;

export function CalendarBlock({
  block,
  brandColor,
  gated = false,
  funnelId,
  sessionId,
  tracking,
}: CalendarBlockProps) {
  const { url, provider } = block.props;
  const { revealedBlockIds } = useLandingInteractive();
  const [embedFailed, setEmbedFailed] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Fires the ad pixel + the `booking` webhook when the embedded calendar
  // reports a confirmed booking. Without this a landing-page booking would be
  // invisible to analytics and to downstream webhook consumers.
  useBookingConfirmed({ funnelId, sessionId, tracking });

  const isRevealed = !gated || revealedBlockIds.has(block.id);

  const safeUrl = useMemo(() => safeHttpUrl(url) ?? "", [url]);

  // The Cal.com JS embed injects a third-party script, so it is only used when
  // the author picked the 'cal' provider AND the URL really is a cal.com host.
  // Hostname is parsed exactly — never `url.includes("cal.com")`, which also
  // matches lookalikes like `cal.com.evil.example`. See ./url.ts.
  const useCalEmbed = provider === "cal" && !!safeUrl && isCalDotComUrl(safeUrl);
  const calLink = useMemo(() => (useCalEmbed ? extractCalLink(safeUrl) : ""), [useCalEmbed, safeUrl]);
  const calNamespace = useMemo(() => calNamespaceFor(calLink), [calLink]);

  useEffect(() => {
    const check = () => setIsMobileScreen(window.innerWidth < MOBILE_BREAKPOINT_PX);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load + init the Cal.com inline embed. Mirrors SuccessStep.tsx: script tag,
  // Cal("init", ns, { origin }), then Cal.ns[ns]("inline"|"ui"). Any failure
  // (script error, missing global, throw, or a 10s empty container) falls back
  // to the plain iframe path below.
  useEffect(() => {
    if (!isRevealed || !useCalEmbed || !calLink || isMobileScreen) return;

    const script = document.createElement("script");
    script.src = "https://app.cal.com/embed/embed.js";
    script.async = true;

    script.onerror = () => setEmbedFailed(true);
    script.onload = () => {
      try {
        const Cal = window.Cal;
        if (!Cal) {
          setEmbedFailed(true);
          return;
        }
        Cal("init", calNamespace, { origin: "https://cal.com" });
        Cal.ns[calNamespace]("inline", {
          elementOrSelector: `#cal-embed-${calNamespace}`,
          calLink,
          layout: "month_view",
          config: { theme: "light" },
        });
        Cal.ns[calNamespace]("ui", {
          theme: "light",
          styles: { branding: { brandColor } },
          hideEventTypeDetails: false,
          layout: "month_view",
        });
      } catch {
        setEmbedFailed(true);
      }
    };

    document.head.appendChild(script);

    const timeout = setTimeout(() => {
      const container = document.getElementById(`cal-embed-${calNamespace}`);
      if (container && container.children.length === 0) setEmbedFailed(true);
    }, EMBED_TIMEOUT_MS);

    return () => {
      clearTimeout(timeout);
      script.remove();
    };
  }, [isRevealed, useCalEmbed, calLink, calNamespace, brandColor, isMobileScreen]);

  // Gated + not yet revealed: keep the element mounted so the id stays a valid
  // scroll target, but render nothing and hide it from assistive tech.
  if (!isRevealed) {
    return <section id={block.id} className="hidden" aria-hidden="true" />;
  }

  const showCalEmbed = useCalEmbed && !!calLink && !embedFailed && !isMobileScreen;
  const bookHref = safeUrl || (calLink ? `https://cal.com/${calLink}` : "");

  return (
    <section id={block.id} className="w-full py-6 sm:py-8">
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] shadow-sm">
        {showCalEmbed ? (
          <div
            id={`cal-embed-${calNamespace}`}
            style={{ width: "100%", height: "min(700px, 80vh)", overflow: "auto" }}
          />
        ) : isMobileScreen && bookHref ? (
          // Calendar embeds are unusable under 600px — hand off to the provider.
          <div className="py-10 text-center">
            <p className="mb-5 text-sm text-[#6B7280]">Tap below to book your call.</p>
            <a
              href={bookHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: brandColor }}
            >
              Book Your Call
            </a>
          </div>
        ) : safeUrl && !embedFailed ? (
          <iframe
            src={safeUrl}
            width="100%"
            height="700"
            className="block"
            style={{ minHeight: "500px", maxHeight: "80vh", border: "0" }}
            title="Book your call"
          />
        ) : bookHref ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-sm text-[#6B7280]">Calendar is loading externally.</p>
            <a
              href={bookHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: brandColor }}
            >
              Book Your Call
            </a>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-[#6B7280]">
            <p className="mb-2 font-medium text-[#0A0A0A]">Thanks!</p>
            <p>Our team will be in touch soon to schedule your call.</p>
          </div>
        )}
      </div>
    </section>
  );
}
