"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, ArrowRight } from "lucide-react";

function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 border border-black/10 bg-white rounded-full px-3 py-1 text-sm font-medium text-[#333333]">
      {icon}
      {children}
    </div>
  );
}

const categories = [
  "Coaching",
  "Agencies",
  "SaaS",
  "Real Estate",
  "Fitness",
  "& more",
];

const templates = [
  {
    title: "SaaS Discovery Call",
    author: "Qualifi",
    clones: 47,
    color: "#4A90D9",
    questions: 5,
  },
  {
    title: "Coaching Qualifier",
    author: "Qualifi",
    clones: 89,
    color: "#F6C744",
    questions: 4,
  },
  {
    title: "Agency Lead Scorer",
    author: "Qualifi",
    clones: 63,
    color: "#E85D75",
    questions: 6,
  },
  {
    title: "Real Estate Booking",
    author: "Qualifi",
    clones: 31,
    color: "#4BC0A0",
    questions: 3,
  },
  {
    title: "Fitness Assessment",
    author: "Qualifi",
    clones: 52,
    color: "#9B6FE8",
    questions: 5,
  },
  {
    title: "Consulting Intake",
    author: "Qualifi",
    clones: 28,
    color: "#F9B31E",
    questions: 7,
  },
];

function TemplateMockup({
  color,
  questions,
}: {
  color: string;
  questions: number;
}) {
  return (
    <div className="bg-[#FBFBFB] p-5 min-h-[160px] flex items-center justify-center">
      <div className="w-full max-w-[200px]">
        {/* Mini quiz mockup */}
        <div className="bg-white rounded-lg border border-[#EBEBEB] p-3">
          <div
            className="h-1.5 w-12 rounded-full mb-3"
            style={{ backgroundColor: color }}
          />
          <div className="space-y-1.5">
            {Array.from({ length: Math.min(questions, 3) }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: `${color}30` }}
                />
                <div
                  className="h-2 rounded-full bg-[#EBEBEB]"
                  style={{ width: `${70 - i * 15}%` }}
                />
              </div>
            ))}
          </div>
          <div
            className="mt-3 h-6 rounded text-[9px] font-medium flex items-center justify-center text-white"
            style={{ backgroundColor: color }}
          >
            Continue
          </div>
        </div>
      </div>
    </div>
  );
}

export function TemplatesSection() {
  const [activeCategory, setActiveCategory] = useState("Coaching");

  return (
    <section className="border-t border-[#F0F0F0] bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <SectionLabel icon={<LayoutGrid className="w-3.5 h-3.5" />}>
            Templates
          </SectionLabel>
          <h2
            className="text-[32px] sm:text-[40px] font-semibold text-[#333333] leading-tight"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Start from proven funnel templates
          </h2>
          <p className="text-[#737373] max-w-xl">
            Clone pre-built funnels, customize with AI, deploy instantly. No
            per-lead fees.
          </p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm px-4 py-2 rounded-full transition-colors border ${
                activeCategory === cat
                  ? "bg-[#333333] text-white border-[#333333]"
                  : "bg-white text-[#737373] border-[#EBEBEB] hover:border-[#D4D4D4]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <TemplateMockup color={t.color} questions={t.questions} />
              <div className="p-5 border-t border-[#EBEBEB]">
                <h3 className="text-sm font-semibold text-[#333333] mb-1">
                  {t.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A3A3A3]">
                    by {t.author}
                  </span>
                  <span className="text-xs text-[#A3A3A3]">
                    {t.clones} clones
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all */}
        <div className="flex justify-center mt-10">
          <button className="inline-flex items-center gap-2 text-sm font-medium text-[#333333] border border-[#EBEBEB] rounded-full px-6 py-2.5 hover:bg-[#FBFBFB] transition-colors">
            View all templates
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
