"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BarChart3, Calendar, MessageSquare, ArrowRight, CheckCircle2, Users, Zap } from "lucide-react";
import Link from "next/link";

const features = [
  {
    id: "build",
    icon: <Sparkles className="w-5 h-5" />,
    title: "Build with AI",
    description: "Describe your business in one sentence. AI generates your quiz questions, lead scoring, and calendar routing automatically.",
    bullets: ["AI-generated quiz questions", "Automatic lead scoring", "Brand customization"],
    mockup: "build",
  },
  {
    id: "score",
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Score every lead",
    description: "Each quiz answer earns points. Leads are automatically scored and sorted into tiers so you know who's ready to buy.",
    bullets: ["Point-based scoring system", "High / Mid / Low tiers", "Custom score thresholds"],
    mockup: "score",
  },
  {
    id: "route",
    icon: <Calendar className="w-5 h-5" />,
    title: "Route to the right calendar",
    description: "Hot leads get your VIP booking link. Warm leads get a discovery call. Cold leads get nurtured via email sequences.",
    bullets: ["Tier-based calendar routing", "Custom redirect URLs", "Automated email follow-ups"],
    mockup: "route",
  },
  {
    id: "analyze",
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Analyze and optimize",
    description: "See exactly where leads drop off. Track conversion rates, device types, UTM sources, and A/B test different versions.",
    bullets: ["Step-by-step drop-off analysis", "UTM tracking built in", "A/B testing with variants"],
    mockup: "analyze",
  },
];

function BuildMockup() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
        </div>
        <span className="text-sm font-medium text-[#111827]">AI Builder</span>
      </div>
      <div className="bg-[#F9FAFB] rounded-lg p-4 mb-4 border border-[#E5E7EB]">
        <p className="text-sm text-[#374151]">I sell business coaching to 6-figure entrepreneurs who want to scale past 7 figures</p>
      </div>
      <div className="space-y-2.5">
        {["Analyzing business type...", "Generating 3 qualifying questions...", "Setting up lead scoring..."].map((step, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.15 }} className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
            <span className="text-xs text-[#2D6A4F] font-medium">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ScoreMockup() {
  const tiers = [
    { label: "Hot Lead", score: "8-10", color: "#2D6A4F", bg: "#2D6A4F/10", count: "38%" },
    { label: "Warm Lead", score: "4-7", color: "#D97706", bg: "#D97706/10", count: "34%" },
    { label: "Cold Lead", score: "0-3", color: "#6B7280", bg: "#6B7280/10", count: "28%" },
  ];
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
      <p className="text-sm font-medium text-[#111827] mb-4">Lead Score Distribution</p>
      <div className="space-y-3">
        {tiers.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.12 }} className="flex items-center gap-3">
            <div className="w-16 text-xs font-medium" style={{ color: t.color }}>{t.label}</div>
            <div className="flex-1 h-8 bg-[#F3F4F6] rounded-lg overflow-hidden">
              <motion.div
                className="h-full rounded-lg"
                style={{ backgroundColor: t.color }}
                initial={{ width: "0%" }}
                animate={{ width: t.count }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
              />
            </div>
            <span className="text-xs font-medium text-[#6B7280] w-8">{t.count}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-[#F3F4F6] flex items-center justify-between">
        <span className="text-xs text-[#9CA3AF]">Score range: 0-10</span>
        <span className="text-xs font-medium text-[#2D6A4F]">147 leads scored</span>
      </div>
    </div>
  );
}

function RouteMockup() {
  const routes = [
    { tier: "Hot", calendar: "VIP Strategy Call", time: "30 min", color: "#2D6A4F" },
    { tier: "Warm", calendar: "Discovery Call", time: "15 min", color: "#D97706" },
    { tier: "Cold", calendar: "Email Nurture Sequence", time: "Auto", color: "#6B7280" },
  ];
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
      <p className="text-sm font-medium text-[#111827] mb-4">Calendar Routing Rules</p>
      <div className="space-y-2.5">
        {routes.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB]">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
            <div className="flex-1">
              <p className="text-xs font-medium text-[#111827]">{r.calendar}</p>
              <p className="text-[10px] text-[#9CA3AF]">{r.tier} tier leads</p>
            </div>
            <span className="text-[10px] text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded">{r.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AnalyzeMockup() {
  const steps = [
    { label: "Page View", pct: 100 },
    { label: "Quiz Started", pct: 78 },
    { label: "Completed", pct: 56 },
    { label: "Email Submitted", pct: 41 },
  ];
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
      <p className="text-sm font-medium text-[#111827] mb-4">Funnel Drop-off</p>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.1 }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#6B7280]">{s.label}</span>
              <span className="text-xs font-medium text-[#111827]">{s.pct}%</span>
            </div>
            <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#2D6A4F] rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${s.pct}%` }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#D97706]" />
          <span className="text-xs text-[#6B7280]">22% drop at Question 2 — consider simplifying</span>
        </div>
      </div>
    </div>
  );
}

const MOCKUP_MAP: Record<string, React.ReactNode> = {
  build: <BuildMockup />,
  score: <ScoreMockup />,
  route: <RouteMockup />,
  analyze: <AnalyzeMockup />,
};

export function HowItWorks() {
  const [active, setActive] = useState("build");

  return (
    <section id="features" className="bg-white py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
            Everything you need to convert visitors into booked calls
          </h2>
          <p className="mt-4 text-lg text-[#6B7280]">
            From AI-powered quiz generation to automated calendar routing — all in one platform.
          </p>
        </div>

        {/* Two-column: left steps, right mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: Feature list */}
          <div className="space-y-1">
            {features.map((f) => (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                className={`w-full text-left p-5 rounded-xl transition-all ${
                  active === f.id
                    ? "bg-[#F9FAFB] border border-[#E5E7EB]"
                    : "border border-transparent hover:bg-[#FAFAFA]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    active === f.id ? "bg-[#2D6A4F] text-white" : "bg-[#F3F4F6] text-[#9CA3AF]"
                  }`}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold mb-1 ${active === f.id ? "text-[#111827]" : "text-[#6B7280]"}`}>
                      {f.title}
                    </h3>
                    {active === f.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                        <p className="text-sm text-[#6B7280] mb-3">{f.description}</p>
                        <ul className="space-y-1.5">
                          {f.bullets.map((b, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-[#374151]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] flex-shrink-0" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </div>
                </div>
                {active === f.id && (
                  <motion.div
                    className="h-0.5 bg-[#2D6A4F] rounded-full mt-4"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5 }}
                    key={f.id}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Right: Animated mockup */}
          <div className="sticky top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {MOCKUP_MAP[active]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/build"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D6A4F] text-white text-sm font-semibold rounded-xl hover:bg-[#245840] transition-colors"
          >
            Try the AI builder
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
