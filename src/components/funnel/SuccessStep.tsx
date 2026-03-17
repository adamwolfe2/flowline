"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { FunnelConfig } from "@/types";

interface SuccessStepProps {
  config: FunnelConfig;
  calendarUrl: string;
  email: string;
}

export function SuccessStep({ config, calendarUrl, email }: SuccessStepProps) {
  const { brand } = config;
  const calEmbed = config.quiz.calEmbed;

  // Load Cal.com embed script if calEmbed is configured
  useEffect(() => {
    if (!calEmbed) return;

    const script = document.createElement("script");
    script.src = "https://app.cal.com/embed/embed.js";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Cal = (window as any).Cal;
      if (Cal) {
        Cal("init", calEmbed.namespace, { origin: "https://cal.com" });
        Cal.ns[calEmbed.namespace]("inline", {
          elementOrSelector: `#cal-embed-${calEmbed.namespace}`,
          calLink: calEmbed.calLink,
          layout: "month_view",
          config: {
            theme: "light",
          },
        });
        Cal.ns[calEmbed.namespace]("ui", {
          theme: "light",
          styles: { branding: { brandColor: calEmbed.brandColor } },
          hideEventTypeDetails: false,
          layout: "month_view",
        });
      }
    };

    return () => {
      script.remove();
    };
  }, [calEmbed]);

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
        {calEmbed ? (
          <div
            id={`cal-embed-${calEmbed.namespace}`}
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
