"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FunnelConfig } from "@/types";
import { EditableOverlay } from "./EditableOverlay";

interface WelcomeStepProps {
  config: FunnelConfig;
  onStart: () => void;
}

export function WelcomeStep({ config, onStart }: WelcomeStepProps) {
  const { brand, quiz } = config;
  const [ctaHover, setCtaHover] = useState(false);

  return (
    <div className="flex flex-col items-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="mb-8"
      >
        <EditableOverlay section="brand" field="logo">
          {brand.logoUrl ? (
            <div className="inline-flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-3">
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                width={120}
                height={40}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-3">
              <span
                className="text-lg font-bold"
                style={{ color: brand.primaryColor, fontFamily: brand.fontHeading }}
              >
                {brand.name}
              </span>
            </div>
          )}
        </EditableOverlay>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="mb-4"
      >
        <EditableOverlay section="content" field="badge">
          <div
            className="inline-block text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: brand.primaryColorLight, color: brand.primaryColor }}
          >
            {quiz.badgeText ?? "Free Application"}
          </div>
        </EditableOverlay>
        <EditableOverlay section="content" field="headline">
          <h1
            className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4"
            style={{ fontFamily: brand.fontHeading }}
          >
            {quiz.headline}
          </h1>
        </EditableOverlay>
        <EditableOverlay section="content" field="subheadline">
          <p className="text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
            {quiz.subheadline}
          </p>
        </EditableOverlay>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full mt-6"
      >
        <EditableOverlay section="content" field="cta">
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-8 rounded-xl text-white font-semibold text-sm sm:text-base shadow-lg transition-shadow hover:shadow-xl"
            style={{
              backgroundColor: ctaHover ? brand.primaryColorDark : brand.primaryColor,
              fontFamily: brand.fontBody,
              minHeight: "48px",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={() => setCtaHover(true)}
            onMouseLeave={() => setCtaHover(false)}
          >
            {quiz.ctaButtonText ?? "Take the Quiz. It Takes 60 Seconds"}
          </motion.button>
        </EditableOverlay>

        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            No spam, ever
          </div>
          <div className="w-1 h-1 bg-gray-200 rounded-full" />
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Only 60 seconds
          </div>
          <div className="w-1 h-1 bg-gray-200 rounded-full" />
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            100% free
          </div>
        </div>
      </motion.div>
    </div>
  );
}
