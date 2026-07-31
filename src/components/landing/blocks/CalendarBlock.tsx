"use client";

import { useEffect, useMemo, useState } from "react";
import type { LandingBlock, TrackingConfig } from "@/types";
import { useLandingInteractive } from "../LandingInteractive";
import { useBookingConfirmed } from "../useBookingConfirmed";
import { CalendarGateOverlay } from "./CalendarGateOverlay";
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

  // Lead-gate: when gate === 'blur_overlay', the calendar renders blurred behind
  // a capture modal until the visitor is captured as a lead. `captured` is the
  // one-way latch that unlocks it. Defaults to ungated for legacy rows.
  const gate = block.props.gate ?? "none";
  const [captured, setCaptured] = useState(false);
  const showGate = gate === "blur_overlay" && !captured;

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
    // Defer the third-party Cal.com script until the gate is cleared: mounting
    // the embed while blurred would expose a bookable iframe behind the overlay.
    if (!isRevealed || showGate || !useCalEmbed || !calLink || isMobileScreen) return;

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
  }, [isRevealed, showGate, useCalEmbed, calLink, calNamespace, brandColor, isMobileScreen]);

  // Gated + not yet revealed: keep the element mounted so the id stays a valid
  // scroll target, but render nothing and hide it from assistive tech.
  if (!isRevealed) {
    return <section id={block.id} className="hidden" aria-hidden="true" />;
  }

  // Lead-gate active: blurred calendar behind a name/email capture modal. The
  // real embed above stays unmounted until `captured` flips, so nothing is
  // bookable until the lead is captured through the hardened submit path.
  if (showGate) {
    return (
      <section id={block.id} className="w-full py-6 sm:py-8">
        <CalendarGateOverlay
          funnelId={funnelId}
          sessionId={sessionId}
          blockId={block.id}
          brandColor={brandColor}
          title={block.props.gateTitle?.trim() || "See available times"}
          subtitle={
            block.props.gateSubtitle?.trim() ||
            "Enter your name and email to unlock the calendar and pick a time."
          }
          ctaLabel={block.props.gateCtaLabel?.trim() || "Unlock the calendar"}
          onUnlock={() => setCaptured(true)}
        />
      </section>
    );
  }

  // The Cal.com JS embed is the richest experience, used on desktop for the
  // 'cal' provider. Everything else — mobile, non-cal providers (Calendly,
  // etc.), and a FAILED/timed-out Cal embed — falls back to an INLINE iframe so
  // the visitor always books on-page. An external link is a last resort, used
  // only when there is no embeddable URL at all. Reducing this friction (never
  // bouncing the visitor off to the provider) is the whole point of the block.
  const showCalEmbed = useCalEmbed && !!calLink && !embedFailed && !isMobileScreen;
  const canEmbedIframe = !!safeUrl;
  const bookHref = safeUrl || (calLink ? `https://cal.com/${calLink}` : "");

  return (
    <section id={block.id} className="w-full py-6 sm:py-8">
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] shadow-sm">
        {showCalEmbed ? (
          <div
            id={`cal-embed-${calNamespace}`}
            style={{ width: "100%", height: "min(700px, 80vh)", overflow: "auto" }}
          />
        ) : canEmbedIframe ? (
          // Universal inline embed: Cal.com (incl. when the JS embed failed),
          // Calendly, or any https booking URL — renders in-page on desktop AND
          // mobile. Height is responsive so the calendar is usable on a phone.
          <iframe
            src={safeUrl}
            className="block w-full h-[620px] sm:h-[720px] max-h-[85vh]"
            style={{ border: "0" }}
            title="Book your call"
            loading="lazy"
          />
        ) : bookHref ? (
          // Last resort only: no embeddable URL was resolvable.
          <div className="py-12 text-center">
            <p className="mb-4 text-sm text-[#6B7280]">Pick a time to book your call.</p>
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
