"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  MousePointerClick,
  Timer,
  ArrowDownToLine,
  Clock,
  Globe,
  Code,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const triggers = [
  {
    icon: MousePointerClick,
    title: "Exit Intent",
    description: "Catches visitors moving to close the tab",
  },
  {
    icon: Timer,
    title: "Time Delay",
    description: "Shows after a set number of seconds",
  },
  {
    icon: ArrowDownToLine,
    title: "Scroll Depth",
    description: "Triggers when visitors scroll past a threshold",
  },
  {
    icon: Clock,
    title: "Idle Detection",
    description: "Engages visitors who stop interacting",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "AI-generated from your URL",
    description:
      "Paste your website link. AI scrapes your brand, writes quiz questions, and builds the popup automatically.",
  },
  {
    icon: Globe,
    title: "Works on any website",
    description:
      "WordPress, Shopify, Webflow, Squarespace, or raw HTML. One script tag is all you need.",
  },
  {
    icon: Code,
    title: "Smart suppression",
    description:
      "Dismissed visitors stay suppressed for 30 days. Converted visitors for a year. No annoying repeat popups.",
  },
];

function PopupMockupAnimation() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    setPhase(0);
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => setPhase(4), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative w-full max-w-[480px] mx-auto">
      {/* Fake website */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Browser chrome */}
        <div className="h-8 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center px-3 gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
          <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
          <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
          <div className="flex-1 mx-6">
            <div className="bg-white border border-[#E5E7EB] rounded px-2 py-0.5 text-[8px] text-[#9CA3AF] text-center max-w-[140px] mx-auto">
              yourwebsite.com
            </div>
          </div>
        </div>

        {/* Website content */}
        <div className="p-6 min-h-[280px] sm:min-h-[320px] relative">
          <div className="space-y-3 opacity-30">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-200" />
              <div className="w-20 h-2.5 rounded bg-gray-200" />
            </div>
            <div className="pt-6 text-center space-y-2">
              <div className="w-52 h-4 rounded bg-gray-200 mx-auto" />
              <div className="w-40 h-4 rounded bg-gray-200 mx-auto" />
              <div className="w-56 h-3 rounded bg-gray-100 mx-auto mt-1" />
              <div className="w-28 h-8 rounded-lg bg-gray-200 mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-3 gap-3 pt-6">
              <div className="h-20 rounded-lg bg-gray-100" />
              <div className="h-20 rounded-lg bg-gray-100" />
              <div className="h-20 rounded-lg bg-gray-100" />
            </div>
          </div>

          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={phase >= 1 ? { opacity: 1 } : {}}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
          >
            {/* Popup modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={phase >= 2 ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-xl shadow-2xl w-[260px] sm:w-[280px] p-5 relative"
            >
              <div className="absolute top-2.5 right-2.5">
                <div className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center">
                  <X className="w-3 h-3 text-gray-400" />
                </div>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 mx-auto mb-3 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#2D6A4F]" />
                </div>
                <div className="text-[10px] font-semibold text-[#2D6A4F] uppercase tracking-wider mb-1">
                  Free Assessment
                </div>
                <div className="text-sm font-bold text-[#111827] mb-1">
                  See If You Qualify
                </div>
                <div className="text-[10px] text-[#6B7280] mb-3">
                  Answer 3 quick questions
                </div>

                {/* Animated options */}
                <div className="space-y-1.5">
                  {["$0 - $10K/month", "$10K - $50K/month", "$50K+/month"].map(
                    (opt, i) => (
                      <motion.div
                        key={opt}
                        initial={{ opacity: 0, x: -8 }}
                        animate={
                          phase >= 3
                            ? { opacity: 1, x: 0 }
                            : {}
                        }
                        transition={{ delay: i * 0.12, duration: 0.25 }}
                        className={`text-[10px] py-2 px-3 rounded-lg border text-left transition-colors ${
                          i === 2 && phase >= 4
                            ? "border-[#2D6A4F] bg-[#2D6A4F]/5 text-[#2D6A4F] font-medium"
                            : "border-[#E5E7EB] text-[#374151]"
                        }`}
                      >
                        {opt}
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Exit intent cursor animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={
              phase >= 1
                ? { opacity: [0, 1, 1, 0], y: [0, -60, -60, -60] }
                : {}
            }
            transition={{ duration: 1.2, times: [0, 0.3, 0.8, 1] }}
            className="absolute top-12 left-1/2 pointer-events-none"
          >
            <MousePointerClick className="w-5 h-5 text-[#2D6A4F]" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function PopupSection() {
  return (
    <section className="border-t border-[#E5E7EB] bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 border border-[#E5E7EB] bg-white rounded-full px-4 py-1.5 mb-4">
              <Zap className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span className="text-xs font-medium text-[#374151]">
                New: Interactive Popups
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-4"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
            >
              Turn your website traffic into
              <br />
              qualified leads
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] max-w-lg mx-auto">
              Exit-intent popups that ask qualifying questions instead of just
              collecting emails. Visitors engage with a quiz, you get scored
              leads.
            </p>
          </motion.div>
        </div>

        {/* Two columns: animation + features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-16 sm:mb-20">
          {/* Left: mockup */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <PopupMockupAnimation />
          </motion.div>

          {/* Right: feature cards */}
          <div className="space-y-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="bg-white border border-[#E5E7EB] rounded-xl p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-[#2D6A4F]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827] mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trigger types */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h3
            className="text-lg sm:text-xl font-bold text-[#111827] text-center mb-8"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            Four trigger types to capture every visitor
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {triggers.map((trigger, i) => (
              <motion.div
                key={trigger.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center hover:shadow-sm transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 flex items-center justify-center mx-auto mb-3">
                  <trigger.icon className="w-5 h-5 text-[#2D6A4F]" />
                </div>
                <h4 className="text-xs font-semibold text-[#111827] mb-1">
                  {trigger.title}
                </h4>
                <p className="text-[10px] text-[#6B7280] leading-relaxed">
                  {trigger.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/build"
            className="inline-flex items-center gap-2 bg-[#2D6A4F] text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-[#245840] transition-colors"
          >
            Create your first popup
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-[#9CA3AF] mt-3">
            Free to start. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}
