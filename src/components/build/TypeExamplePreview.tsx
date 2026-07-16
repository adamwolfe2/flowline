"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Target, ArrowRight } from "lucide-react";
import type { BuildPageType } from "./PageTypeChoice";

/**
 * Shows a concrete example of what the selected funnel type looks like, in the
 * builder's right-hand panel, BEFORE the user generates anything. Lets a
 * prospect see exactly what "Multi-step quiz funnel" vs "Single landing page"
 * produces. Swaps live as the PageTypeChoice selection changes.
 */

function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[380px] bg-white ring-1 ring-black/[0.06] rounded-[20px] overflow-hidden shadow-[0_20px_60px_-24px_rgba(6,60,110,0.25)]">
      <div className="h-8 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center px-3 gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
        <div className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
        <div className="w-2 h-2 rounded-full bg-[#28C840]" />
        <div className="flex-1 mx-3">
          <div className="bg-white border border-[#E5E7EB] rounded px-2 py-0.5 text-[9px] text-[#9CA3AF] text-center max-w-[180px] mx-auto truncate">
            {url}
          </div>
        </div>
      </div>
      <div className="p-4 bg-[#F9FAFB]">{children}</div>
    </div>
  );
}

function LandingExample() {
  return (
    <div className="space-y-2.5">
      <div className="text-center space-y-1">
        <div className="w-8 h-8 rounded-lg bg-[#0A9AFF]/10 mx-auto flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded bg-[#0A9AFF]" />
        </div>
        <div className="text-[12px] font-bold text-[#0A0A0A] leading-tight">
          Watch How We 3× Your Booked Calls
        </div>
        <div className="text-[9px] text-[#6B7280]">A 4-minute breakdown for coaches</div>
      </div>
      <div className="relative aspect-video w-full rounded-lg bg-[#111827] flex items-center justify-center">
        <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow">
          <Play className="w-3.5 h-3.5 text-[#0A9AFF] fill-[#0A9AFF] ml-0.5" />
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-2.5 space-y-1.5">
        <div className="h-6 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] flex items-center px-2">
          <span className="text-[9px] text-[#9CA3AF]">Your name</span>
        </div>
        <div className="h-6 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] flex items-center px-2">
          <span className="text-[9px] text-[#9CA3AF]">you@company.com</span>
        </div>
        <div className="h-7 rounded-md bg-[#0A9AFF] flex items-center justify-center">
          <span className="text-[10px] font-semibold text-white">Book Your Call</span>
        </div>
      </div>
    </div>
  );
}

function QuizExample() {
  const options = [
    { text: "Under $10K / month", selected: false },
    { text: "$10K – $50K / month", selected: true },
    { text: "$50K+ / month", selected: false },
  ];
  return (
    <div className="space-y-2.5">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[8px] font-medium text-[#6B7280]">
          <span>Question 2 of 3</span>
          <span>66%</span>
        </div>
        <div className="h-1 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
          <div className="h-full rounded-full bg-[#0A9AFF]" style={{ width: "66%" }} />
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-3 space-y-2">
        <div className="text-[12px] font-bold text-[#0A0A0A] leading-tight">
          What is your monthly revenue?
        </div>
        <div className="space-y-1.5">
          {options.map((opt) => (
            <div
              key={opt.text}
              className={`flex items-center justify-between rounded-md border px-2 py-1.5 text-[10px] font-medium ${
                opt.selected
                  ? "border-[#0A9AFF] bg-[#0A9AFF]/5 text-[#0A9AFF]"
                  : "border-[#E5E7EB] text-[#6B7280]"
              }`}
            >
              <span>{opt.text}</span>
              {opt.selected && (
                <span className="text-[8px] font-bold text-[#0A9AFF] bg-[#0A9AFF]/10 rounded-full px-1.5 py-0.5">
                  +25 pts
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[9px] font-medium text-[#6B7280]">
          <Target className="w-2.5 h-2.5 text-[#0A9AFF]" />
          <span>Score 45 — Discovery Call</span>
        </div>
        <div className="h-6 rounded-md bg-[#0A9AFF] flex items-center gap-1 px-2.5">
          <span className="text-[9px] font-semibold text-white">Next</span>
          <ArrowRight className="w-2.5 h-2.5 text-white" />
        </div>
      </div>
    </div>
  );
}

export function TypeExamplePreview({ pageType }: { pageType: BuildPageType }) {
  const isLanding = pageType === "landing";
  return (
    <div className="flex flex-col items-center">
      <p
        className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3"
        style={{ fontFamily: "var(--font-instrument-sans)" }}
      >
        Example · {isLanding ? "Single landing page" : "Multi-step quiz funnel"}
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={pageType}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          <BrowserFrame url={isLanding ? "yourbrand.com/watch" : "yourbrand.com/qualify"}>
            {isLanding ? <LandingExample /> : <QuizExample />}
          </BrowserFrame>
        </motion.div>
      </AnimatePresence>
      <p className="text-xs text-[#9CA3AF] mt-4 text-center max-w-xs">
        Describe your business on the left — we&apos;ll build your{" "}
        {isLanding ? "landing page" : "quiz funnel"} in seconds.
      </p>
    </div>
  );
}
