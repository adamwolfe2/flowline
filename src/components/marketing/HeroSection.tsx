"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MousePointerClick, BarChart3, Calendar } from "lucide-react";

function BrowserMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="relative mt-16 mx-auto max-w-4xl"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/10"
      >
        {/* Browser chrome */}
        <div className="bg-[#1A1A1F] px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-[#2A2A30] rounded-md px-3 py-1.5 text-xs text-gray-500 text-center">
              app.qualifi.io/builder
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="bg-white p-6 md:p-8">
          <div className="grid md:grid-cols-[240px_1fr] gap-6">
            {/* Sidebar */}
            <div className="hidden md:block space-y-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Funnel Steps
              </div>
              {["Welcome Screen", "Quiz Question 1", "Quiz Question 2", "Results + CTA"].map(
                (step, i) => (
                  <div
                    key={step}
                    className={`px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 ${
                      i === 1
                        ? "bg-indigo-50 text-indigo-700 font-medium border border-indigo-200"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded text-xs flex items-center justify-center font-medium ${
                        i === 1
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {i + 1}
                    </div>
                    {step}
                  </div>
                )
              )}
            </div>

            {/* Editor */}
            <div className="border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="text-sm font-medium text-gray-800">
                What&apos;s your biggest challenge right now?
              </div>
              <div className="space-y-2">
                {["Not enough leads", "Leads aren't qualified", "No-shows on calls"].map(
                  (opt) => (
                    <div
                      key={opt}
                      className="border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 hover:border-indigo-300 transition-colors cursor-pointer"
                    >
                      {opt}
                    </div>
                  )
                )}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="bg-[#6366F1] text-white text-xs px-3 py-1.5 rounded-md">
                  Continue
                </div>
                <span className="text-xs text-gray-400">Score: +10 pts</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section className="relative bg-[#09090B] pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      {/* Subtle gradient orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        {/* Tag pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm px-4 py-1.5 rounded-full mb-8"
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          VSL Funnels That Convert
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-[family-name:var(--font-sora)] text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight"
        >
          Fill Your Calendar
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-300">
            With Qualified Leads
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-[family-name:var(--font-dm-sans)] mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          Three questions. Smart scoring. Automatic routing to the right
          calendar. Build your funnel in 60 seconds — no code required.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/sign-up"
            className="bg-[#6366F1] hover:bg-[#5558E6] text-white font-medium text-base px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
          >
            Build My Funnel Free
          </Link>
          <a
            href="#examples"
            className="border border-white/15 text-gray-300 hover:text-white hover:border-white/30 font-medium text-base px-8 py-3.5 rounded-xl transition-colors"
          >
            See a Live Example
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-500"
        >
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <span>
            Trusted by{" "}
            <span className="text-gray-300 font-medium">
              500+ coaches, agencies, and consultants
            </span>
          </span>
        </motion.div>

        {/* Browser mockup */}
        <BrowserMockup />

        {/* Mini stat badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>
              <span className="text-white font-semibold">3.2x</span> more
              qualified bookings
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>
              <span className="text-white font-semibold">60s</span> funnel
              setup
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
