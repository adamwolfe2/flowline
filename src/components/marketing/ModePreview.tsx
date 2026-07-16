"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutTemplate,
  ListChecks,
  Play,
  CheckCircle2,
  Target,
  Calendar,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Two product modes, shown side-by-side via a segmented toggle.      */
/*  Mirrors ProductDemo's visual language (browser chrome, frosted     */
/*  segmented control, #0A9AFF brand, Instrument Sans).                */
/* ------------------------------------------------------------------ */

type Mode = "landing" | "quiz";

const MODES = [
  { id: "landing" as const, label: "Landing Page", icon: LayoutTemplate },
  { id: "quiz" as const, label: "Quiz Funnel", icon: ListChecks },
];

interface ModeCopy {
  headline: string;
  sub: string;
  bullets: { icon: React.ElementType; text: string }[];
  cta: string;
}

const COPY: Record<Mode, ModeCopy> = {
  landing: {
    headline: "One scroll-stopping page",
    sub: "A single drag-and-drop page — hero, video, and one clear call to action.",
    bullets: [
      { icon: Play, text: "Lead with a VSL or webinar replay" },
      { icon: CheckCircle2, text: "One booking form, one calendar — no steps" },
      { icon: Calendar, text: "Perfect for VSL funnels and event sign-ups" },
    ],
    cta: "Build a landing page",
  },
  quiz: {
    headline: "Qualify before they book",
    sub: "A guided multi-step quiz that scores every lead and routes by intent.",
    bullets: [
      { icon: ListChecks, text: "Multi-step questions that pre-qualify" },
      { icon: Target, text: "Automatic lead scoring on every answer" },
      { icon: Calendar, text: "Tier-based calendar routing — hot leads book first" },
    ],
    cta: "Build a quiz funnel",
  },
};

/* --- Landing page mockup (single page) --- */

function LandingMockup() {
  return (
    <div className="w-full max-w-[340px] space-y-3">
      {/* Logo + headline */}
      <div className="text-center space-y-1.5">
        <div className="w-9 h-9 rounded-lg bg-[#0A9AFF]/10 mx-auto flex items-center justify-center">
          <div className="w-4 h-4 rounded bg-[#0A9AFF]" />
        </div>
        <div className="text-[13px] font-bold text-[#0A0A0A] leading-tight">
          Watch How We 3× Your Booked Calls
        </div>
        <div className="text-[10px] text-[#6B7280]">
          A 4-minute breakdown for coaches and agencies
        </div>
      </div>

      {/* 16:9 video block */}
      <div className="relative aspect-video w-full rounded-xl bg-[#111827] overflow-hidden flex items-center justify-center">
        <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
          <Play className="w-4 h-4 text-[#0A9AFF] fill-[#0A9AFF] ml-0.5" />
        </div>
        <span className="absolute bottom-1.5 right-2 text-[8px] font-mono text-white/60">
          4:12
        </span>
      </div>

      {/* Booking form */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 space-y-2">
        <div className="h-7 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] flex items-center px-2.5">
          <span className="text-[10px] text-[#9CA3AF]">Your name</span>
        </div>
        <div className="h-7 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] flex items-center px-2.5">
          <span className="text-[10px] text-[#9CA3AF]">you@company.com</span>
        </div>
        <div className="h-8 rounded-lg bg-[#0A9AFF] flex items-center justify-center">
          <span className="text-[11px] font-semibold text-white">Book Your Call</span>
        </div>
      </div>
    </div>
  );
}

/* --- Quiz funnel mockup (multi-step) --- */

function QuizMockup() {
  const options = [
    { text: "Under $10K / month", selected: false },
    { text: "$10K – $50K / month", selected: true },
    { text: "$50K+ / month", selected: false },
  ];

  return (
    <div className="w-full max-w-[340px] space-y-3">
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[9px] font-medium text-[#6B7280]">
          <span>Question 2 of 3</span>
          <span>66%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#0A9AFF]"
            initial={{ width: "33%" }}
            animate={{ width: "66%" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-3.5 space-y-2.5">
        <div className="text-[13px] font-bold text-[#0A0A0A] leading-tight">
          What is your monthly revenue?
        </div>
        <div className="space-y-1.5">
          {options.map((opt) => (
            <div
              key={opt.text}
              className={`flex items-center justify-between rounded-lg border px-2.5 py-2 text-[11px] font-medium transition-colors ${
                opt.selected
                  ? "border-[#0A9AFF] bg-[#0A9AFF]/5 text-[#0A9AFF]"
                  : "border-[#E5E7EB] text-[#6B7280]"
              }`}
            >
              <span>{opt.text}</span>
              {opt.selected && (
                <span className="text-[9px] font-bold text-[#0A9AFF] bg-[#0A9AFF]/10 rounded-full px-2 py-0.5">
                  +25 pts
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Score + next */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#6B7280]">
          <Target className="w-3 h-3 text-[#0A9AFF]" />
          <span>Score: 45 — routing to Discovery Call</span>
        </div>
        <div className="h-7 rounded-lg bg-[#0A9AFF] flex items-center gap-1 px-3">
          <span className="text-[10px] font-semibold text-white">Next</span>
          <ArrowRight className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  );
}

export function ModePreview() {
  const [mode, setMode] = useState<Mode>("landing");
  const copy = COPY[mode];

  return (
    <section
      id="funnel-types"
      className="bg-white py-20 sm:py-28 px-4 sm:px-6"
      style={{ fontFamily: "var(--font-instrument-sans)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#0A0A0A] tracking-[-0.03em] mb-4">
            One builder. Two funnel types.
          </h2>
          <p className="text-lg text-[#6B7280] max-w-xl mx-auto">
            Guide prospects through a scored quiz, or send them to a single high-converting
            landing page. Same AI, same pipeline.
          </p>
        </div>

        {/* Segmented toggle */}
        <div className="flex justify-center mb-10">
          <div
            role="tablist"
            aria-label="Funnel type"
            className="inline-flex items-center gap-0.5 bg-white/80 backdrop-blur-sm rounded-[14px] p-1.5 ring-1 ring-black/[0.06] shadow-sm"
          >
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMode(m.id)}
                  className={`relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                    active ? "text-white" : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="modePill"
                      className="absolute inset-0 rounded-[10px] bg-[#0A0A0A] shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <m.icon
                    className={`relative w-4 h-4 ${active ? "text-[#7CC8FB]" : ""}`}
                  />
                  <span className="relative">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Browser chrome wrapper */}
        <div className="bg-white ring-1 ring-black/[0.06] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-[0_24px_70px_-24px_rgba(6,60,110,0.25)]">
          {/* Browser bar */}
          <div className="h-10 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center px-4 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            <div className="flex-1 mx-4 sm:mx-8">
              <div className="bg-white border border-[#E5E7EB] rounded px-3 py-1 text-[10px] text-[#9CA3AF] text-center max-w-[220px] mx-auto">
                {mode === "landing" ? "yourbrand.com/watch" : "yourbrand.com/qualify"}
              </div>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 min-h-[340px] sm:min-h-[400px]"
            >
              {/* LEFT: copy */}
              <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#0A0A0A] mb-3">
                  {copy.headline}
                </h3>
                <p className="text-[13px] sm:text-sm text-[#6B7280] leading-relaxed mb-5 sm:mb-6">
                  {copy.sub}
                </p>
                <div className="space-y-2 sm:space-y-3.5 mb-6">
                  {copy.bullets.map((bullet, i) => (
                    <div key={i} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#0A9AFF]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <bullet.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0A9AFF]" />
                      </div>
                      <p className="text-[13px] sm:text-sm text-[#6B7280] leading-relaxed">
                        {bullet.text}
                      </p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/build"
                  className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#0A0A0A] text-white text-[13px] sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-[10px] hover:bg-[#232323] transition-colors self-start"
                >
                  {copy.cta} <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Link>
              </div>

              {/* RIGHT: inline preview */}
              <div className="bg-[#F9FAFB] p-5 sm:p-6 md:p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-[#E5E7EB]">
                {mode === "landing" ? <LandingMockup /> : <QuizMockup />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
