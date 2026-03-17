"use client";

import { motion } from "framer-motion";
import { FunnelGenerator } from "./FunnelGenerator";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-16">
      {/* Forest background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/hero-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      />

      {/* Light transparent fade — NO darkening, just blend to page bg at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, transparent 0%, transparent 40%, rgba(255,255,255,0.3) 60%, rgba(255,255,255,0.7) 80%, #FFFFFF 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-28 md:pt-32 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="text-[48px] sm:text-[56px] md:text-[68px] font-semibold leading-none text-white"
            style={{
              fontFamily: "var(--font-lora)",
              textShadow: "0 2px 24px rgba(0,0,0,0.12)",
            }}
          >
            Your VSL funnel.
            <br />
            <span className="text-white/70">Built in 60 seconds.</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-base sm:text-lg md:text-xl text-white/85 max-w-xl mt-5 mb-5"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.08)" }}
        >
          Describe your product in one sentence. AI generates the questions, scoring, and booking flow. You're live in minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-1.5 mb-10 text-sm text-white/80"
        >
          <span className="inline-flex items-center bg-white/15 rounded-md px-1.5 py-0.5 text-white">
            No code.
          </span>
          <span className="inline-flex items-center bg-white/15 rounded-md px-1.5 py-0.5 text-white">
            No designer.
          </span>
          <span className="inline-flex items-center bg-white/15 rounded-md px-1.5 py-0.5 text-white">
            No agency.
          </span>
        </motion.div>

        {/* AI Funnel Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="w-full"
        >
          <FunnelGenerator />
        </motion.div>
      </div>
    </section>
  );
}
