"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 border border-[#E5E7EB] bg-white rounded-full px-3 py-1 text-sm font-medium text-[#111827]">
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
  { title: "Life Coach Qualifier", color: "#F6C744", questions: 4, category: "Coaching", prompt: "I'm a life coach who helps professionals find clarity and purpose" },
  { title: "Executive Coach Intake", color: "#4BC0A0", questions: 5, category: "Coaching", prompt: "I provide executive coaching for C-suite leaders at mid-size companies" },
  { title: "Group Coaching Screener", color: "#9B6FE8", questions: 3, category: "Coaching", prompt: "I run group coaching programs for entrepreneurs scaling to 7 figures" },
  { title: "Agency Lead Scorer", color: "#E85D75", questions: 6, category: "Agencies", prompt: "I run a digital marketing agency for ecommerce brands" },
  { title: "Creative Agency Qualifier", color: "#2D6A4F", questions: 4, category: "Agencies", prompt: "I run a creative agency specializing in brand identity and web design" },
  { title: "Marketing Agency Intake", color: "#4A90D9", questions: 5, category: "Agencies", prompt: "I run a marketing agency helping B2B SaaS companies grow" },
  { title: "SaaS Discovery Call", color: "#4A90D9", questions: 5, category: "SaaS", prompt: "I sell a B2B SaaS product for team collaboration and project management" },
  { title: "Product Demo Qualifier", color: "#9B6FE8", questions: 4, category: "SaaS", prompt: "I sell an AI-powered analytics platform for ecommerce stores" },
  { title: "Enterprise Sales Funnel", color: "#333333", questions: 6, category: "SaaS", prompt: "I sell enterprise software to large organizations with complex procurement" },
  { title: "Real Estate Booking", color: "#4BC0A0", questions: 3, category: "Real Estate", prompt: "I help first-time home buyers find properties in their budget" },
  { title: "Luxury Home Qualifier", color: "#F6C744", questions: 5, category: "Real Estate", prompt: "I sell luxury homes and estates to high-net-worth buyers" },
  { title: "Investment Property Lead", color: "#E85D75", questions: 4, category: "Real Estate", prompt: "I help real estate investors find and evaluate rental properties" },
  { title: "Fitness Assessment", color: "#9B6FE8", questions: 5, category: "Fitness", prompt: "I sell online fitness coaching for busy professionals" },
  { title: "Personal Training Intake", color: "#4BC0A0", questions: 3, category: "Fitness", prompt: "I'm a personal trainer specializing in strength training and nutrition" },
  { title: "Nutrition Coach Screener", color: "#2D6A4F", questions: 4, category: "Fitness", prompt: "I'm a nutrition coach helping clients with meal planning and weight loss" },
  { title: "Consulting Intake", color: "#2D6A4F", questions: 7, category: "& more", prompt: "I provide business consulting for small to mid-size companies" },
  { title: "Legal Consultation Funnel", color: "#333333", questions: 4, category: "& more", prompt: "I'm a lawyer offering legal consultation for small businesses" },
  { title: "Financial Advisor Qualifier", color: "#4A90D9", questions: 5, category: "& more", prompt: "I'm a financial advisor helping professionals plan for retirement" },
];

function TemplateMockup({
  color,
  questions,
}: {
  color: string;
  questions: number;
}) {
  return (
    <div className="bg-[#F9FAFB] p-5 min-h-[160px] flex items-center justify-center">
      <div className="w-full max-w-[200px]">
        {/* Mini quiz mockup */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-3">
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
                  className="h-2 rounded-full bg-[#E5E7EB]"
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
    <section className="border-t border-[#E5E7EB] bg-white py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <SectionLabel icon={<LayoutGrid className="w-3.5 h-3.5" />}>
            Templates
          </SectionLabel>
          <h2
            className="text-2xl sm:text-[32px] md:text-[40px] font-semibold text-[#111827] leading-tight"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            Start with a template. Live in minutes.
          </h2>
          <p className="text-[#6B7280] max-w-xl">
            Pick a funnel, tweak the copy, upload your logo. No per-lead fees, ever.
          </p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm px-4 py-2.5 rounded-full transition-colors border min-h-[44px] ${
                activeCategory === cat
                  ? "bg-[#2D6A4F] text-white border-[#2D6A4F]"
                  : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#D1D5DB]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template grid — filtered by category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {templates
            .filter((t) => t.category === activeCategory)
            .map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  href={`/build?prompt=${encodeURIComponent(t.prompt)}`}
                  className="group block bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#D1D5DB] transition-all duration-200"
                >
                  <TemplateMockup color={t.color} questions={t.questions} />
                  <div className="p-5 border-t border-[#E5E7EB]">
                    <h3 className="text-sm font-semibold text-[#111827] mb-1">
                      {t.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#9CA3AF]">
                        {t.questions} questions
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-[#2D6A4F] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Use this template
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
        </div>

        {/* View all */}
        <div className="flex justify-center mt-10">
          <Link href="/sign-up" className="inline-flex items-center gap-2 text-sm font-medium text-[#111827] border border-[#E5E7EB] rounded-full px-6 py-2.5 hover:bg-[#F9FAFB] transition-colors">
            View all templates
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
