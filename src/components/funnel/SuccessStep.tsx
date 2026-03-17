"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FunnelConfig } from "@/types";

interface SuccessStepProps {
  config: FunnelConfig;
  calendarUrl: string;
  email: string;
}

export function SuccessStep({ config, calendarUrl, email }: SuccessStepProps) {
  const { brand } = config;

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

    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Cal = (window as any).Cal;
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
      }
    };

    return () => {
      script.remove();
    };
  }, [useCalEmbed, effectiveCalLink, effectiveNamespace, effectiveBrandColor]);

  return (
    <div className="w-full px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
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

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <h2
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: brand.fontHeading }}
          >
            You qualify!
          </h2>
          <p className="text-sm text-gray-500">
            We sent a confirmation to <span className="font-medium text-gray-700">{email}</span>.
            Pick a time that works for you below.
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
      >
        {useCalEmbed && effectiveCalLink ? (
          <div
            id={`cal-embed-${effectiveNamespace}`}
            style={{ width: "100%", height: "700px", overflow: "auto" }}
          />
        ) : calendarUrl ? (
          <iframe
            src={calendarUrl}
            width="100%"
            height="700"
            frameBorder="0"
            className="block"
            style={{ minHeight: "600px" }}
            title="Book your call"
          />
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ height: "400px", backgroundColor: brand.primaryColorLight }}
          >
            <div className="text-center">
              <svg className="animate-spin w-8 h-8 mx-auto mb-3" style={{ color: brand.primaryColor }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-gray-500">Loading your calendar...</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
