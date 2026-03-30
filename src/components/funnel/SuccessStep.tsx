"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FunnelConfig } from "@/types";

declare global {
  interface Window {
    Cal?: ((...args: unknown[]) => void) & { ns: Record<string, (...args: unknown[]) => void> };
  }
}

interface SuccessStepProps {
  config: FunnelConfig;
  calendarUrl: string;
  email: string;
  score?: number;
  tier?: string;
}

export function SuccessStep({ config, calendarUrl, email, score, tier }: SuccessStepProps) {
  const { brand } = config;
  const [calEmbedFailed, setCalEmbedFailed] = useState(false);

  // Tier-specific results
  const tierResults = config.quiz.results?.[tier as keyof typeof config.quiz.results];
  const headline = tierResults?.headline || config.quiz.successHeadline || "You qualify!";
  const subtext = tierResults?.subtext || config.quiz.successSubtext || "We sent a confirmation to {email}. Pick a time that works for you below.";

  // Auto-detect Cal.com from the calendar URL
  const isCalcom = useMemo(() => calendarUrl.includes("cal.com"), [calendarUrl]);
  const calLink = useMemo(() => {
    if (!isCalcom) return "";
    return calendarUrl.replace(/https?:\/\/(app\.)?cal\.com\//, "");
  }, [calendarUrl, isCalcom]);
  const calNamespace = useMemo(() => {
    if (!calLink) return "default";
    return calLink.replace(/[^a-zA-Z0-9]/g, "-") || "default";
  }, [calLink]);

  const safeCalendarUrl = useMemo(() => {
    if (!calendarUrl) return "";
    try {
      const parsed = new URL(calendarUrl);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return calendarUrl;
      }
      return "";
    } catch {
      return "";
    }
  }, [calendarUrl]);

  // Also support the legacy calEmbed config if present
  const legacyCalEmbed = config.quiz.calEmbed;

  // Determine which Cal.com config to use
  const effectiveCalLink = isCalcom ? calLink : legacyCalEmbed?.calLink ?? "";
  const effectiveNamespace = isCalcom ? calNamespace : legacyCalEmbed?.namespace ?? "default";
  const effectiveBrandColor = legacyCalEmbed?.brandColor ?? brand.primaryColor;
  const useCalEmbed = isCalcom || !!legacyCalEmbed;

  // Load Cal.com embed script if needed
  useEffect(() => {
    if (!useCalEmbed || !effectiveCalLink) return;

    const script = document.createElement("script");
    script.src = "https://app.cal.com/embed/embed.js";
    script.async = true;
    document.head.appendChild(script);

    let timeout: ReturnType<typeof setTimeout>;

    script.onerror = () => {
      setCalEmbedFailed(true);
    };

    script.onload = () => {
      try {
        const Cal = window.Cal;
        if (Cal) {
          Cal("init", effectiveNamespace, { origin: "https://cal.com" });
          Cal.ns[effectiveNamespace]("inline", {
            elementOrSelector: `#cal-embed-${effectiveNamespace}`,
            calLink: effectiveCalLink,
            layout: "month_view",
            config: {
              theme: "light",
            },
          });
          Cal.ns[effectiveNamespace]("ui", {
            theme: "light",
            styles: { branding: { brandColor: effectiveBrandColor } },
            hideEventTypeDetails: false,
            layout: "month_view",
          });
        } else {
          setCalEmbedFailed(true);
        }
      } catch {
        setCalEmbedFailed(true);
      }
    };

    // 10s timeout fallback
    timeout = setTimeout(() => {
      const container = document.getElementById(`cal-embed-${effectiveNamespace}`);
      if (container && container.children.length === 0) {
        setCalEmbedFailed(true);
      }
    }, 10000);

    return () => {
      clearTimeout(timeout);
      script.remove();
    };
  }, [useCalEmbed, effectiveCalLink, effectiveNamespace, effectiveBrandColor]);

  return (
    <div className="w-full px-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 200 }}
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: brand.primaryColorLight }}
        >
          <svg
            className="w-8 h-8"
            style={{ color: brand.primaryColor }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        {score !== undefined && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{ backgroundColor: brand.primaryColorLight, color: brand.primaryColor }}
          >
            Score: {score}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <h2
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: brand.fontHeading }}
          >
            {headline}
          </h2>
          <p className="text-sm text-gray-500">
            {subtext.split("{email}").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <span className="font-medium text-gray-700">{email}</span>}
              </span>
            ))}
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
      >
        {useCalEmbed && effectiveCalLink && !calEmbedFailed ? (
          <div
            id={`cal-embed-${effectiveNamespace}`}
            style={{ width: "100%", height: "min(700px, 80vh)", overflow: "auto" }}
          />
        ) : safeCalendarUrl ? (
          <iframe
            src={safeCalendarUrl}
            width="100%"
            height="700"
            frameBorder="0"
            className="block"
            style={{ minHeight: "500px", maxHeight: "80vh" }}
            title="Book your call"
          />
        ) : calEmbedFailed && safeCalendarUrl ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500 mb-4">Calendar is loading externally.</p>
            <a
              href={safeCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-base shadow-lg transition-all hover:opacity-90"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Book Your Call
            </a>
          </div>
        ) : (
          <div className="text-center py-8 text-[#6B7280] text-sm">
            <p className="font-medium text-[#111827] mb-2">Your results are ready!</p>
            <p>Our team will be in touch soon to schedule your call.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
