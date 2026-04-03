"use client";

import Link from "next/link";
import { Check, X, Minus, ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { CompetitorData } from "@/app/compare/data";

function FeatureIcon({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#2D6A4F]/10">
        <Check className="w-4 h-4 text-[#2D6A4F]" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50">
        <X className="w-4 h-4 text-red-400" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50">
        <Minus className="w-4 h-4 text-amber-500" />
      </span>
      <span className="text-xs text-[#6B7280]">{value}</span>
    </span>
  );
}

function FeatureTable({ data }: { data: CompetitorData }) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    data.features.forEach((cat) => {
      initial[cat.category] = true;
    });
    return initial;
  });

  function toggleCategory(category: string) {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }

  return (
    <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] bg-[#F9FAFB] border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-3">
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Feature</span>
        </div>
        <div className="px-3 sm:px-4 py-3 text-center border-l border-[#E5E7EB] bg-[#2D6A4F]/5">
          <span className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider">MyVSL</span>
        </div>
        <div className="px-3 sm:px-4 py-3 text-center border-l border-[#E5E7EB]">
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider truncate block">
            {data.name.length > 14 ? data.name.slice(0, 14) + "..." : data.name}
          </span>
        </div>
      </div>

      {/* Categories */}
      {data.features.map((category) => (
        <div key={category.category}>
          {/* Category header */}
          <button
            onClick={() => toggleCategory(category.category)}
            className="w-full grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] bg-[#F9FAFB]/50 border-b border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors"
          >
            <div className="px-4 sm:px-6 py-2.5 flex items-center gap-2 text-left">
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#9CA3AF] transition-transform ${
                  expandedCategories[category.category] ? "rotate-0" : "-rotate-90"
                }`}
              />
              <span className="text-sm font-semibold text-[#111827]">{category.category}</span>
            </div>
            <div className="border-l border-[#E5E7EB]" />
            <div className="border-l border-[#E5E7EB]" />
          </button>

          {/* Feature rows */}
          {expandedCategories[category.category] &&
            category.items.map((item) => (
              <div
                key={item.name}
                className="grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB]/50 transition-colors"
              >
                <div className="px-4 sm:px-6 py-3">
                  <span className="text-sm text-[#374151]">{item.name}</span>
                </div>
                <div className="px-3 sm:px-4 py-3 flex items-center justify-center border-l border-[#E5E7EB] bg-[#2D6A4F]/[0.02]">
                  <FeatureIcon value={item.myvsl} />
                </div>
                <div className="px-3 sm:px-4 py-3 flex items-center justify-center border-l border-[#E5E7EB]">
                  <FeatureIcon value={item.competitor} />
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

function PricingComparison({ data }: { data: CompetitorData }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* MyVSL pricing */}
      <div className="border-2 border-[#2D6A4F] rounded-2xl p-6 relative">
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#2D6A4F] text-white">
            MyVSL
          </span>
        </div>
        <div className="space-y-3 mt-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-[#374151]">Free</span>
            <span className="text-sm text-[#6B7280]">{data.pricing.myvsl.free}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-[#374151]">Pro</span>
            <span className="text-sm text-[#6B7280]">{data.pricing.myvsl.pro}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-[#374151]">Agency</span>
            <span className="text-sm text-[#6B7280]">{data.pricing.myvsl.agency}</span>
          </div>
        </div>
      </div>

      {/* Competitor pricing */}
      <div className="border border-[#E5E7EB] rounded-2xl p-6 relative">
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#F3F4F6] text-[#6B7280]">
            {data.name}
          </span>
        </div>
        <div className="space-y-3 mt-2">
          {data.pricing.competitor.plans.map((plan) => (
            <div key={plan.name} className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-[#374151]">{plan.name}</span>
              <span className="text-sm text-[#6B7280]">{plan.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ComparisonPage({ data }: { data: CompetitorData }) {
  return (
    <div
      className="bg-white min-h-screen"
      style={{ fontFamily: "var(--font-instrument-sans)" }}
    >
      {/* Hero */}
      <section className="pt-12 sm:pt-20 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium text-[#2D6A4F] uppercase tracking-wider mb-4">
            MyVSL vs {data.name}
          </p>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#111827] leading-tight mb-6"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            {data.tagline}
          </h1>
          <p className="text-lg text-[#6B7280] max-w-3xl mx-auto leading-relaxed">
            {data.heroDescription}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/build"
              className="inline-flex items-center gap-2 bg-[#2D6A4F] text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-[#245840] transition-colors"
            >
              Try MyVSL Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 border border-[#E5E7EB] text-[#374151] rounded-xl px-6 py-3 text-sm font-medium hover:bg-[#F9FAFB] transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#111827] mb-2"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            Feature Comparison
          </h2>
          <p className="text-[#6B7280] mb-8">
            A detailed look at what each platform offers across key categories.
          </p>
          <FeatureTable data={data} />
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-12 px-4 sm:px-6 bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#111827] mb-2"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            Pricing Comparison
          </h2>
          <p className="text-[#6B7280] mb-8">
            See how the plans and pricing stack up side by side.
          </p>
          <PricingComparison data={data} />
        </div>
      </section>

      {/* SEO Body Copy Sections */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {data.sections.map((section, i) => (
            <div key={i} className="mb-12 last:mb-0">
              <h2
                className="text-xl sm:text-2xl font-bold text-[#111827] mb-4"
                style={{ fontFamily: "var(--font-plus-jakarta)" }}
              >
                {section.heading}
              </h2>
              {section.body.split("\n\n").map((paragraph, j) => (
                <p key={j} className="text-[#374151] leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-4"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            {data.ctaHeading}
          </h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto mb-8">
            {data.ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/build"
              className="inline-flex items-center gap-2 bg-[#2D6A4F] text-white rounded-xl px-8 py-3.5 text-base font-semibold hover:bg-[#245840] transition-colors"
            >
              Build Your Funnel Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 border border-[#E5E7EB] text-[#374151] rounded-xl px-8 py-3.5 text-base font-medium hover:bg-white transition-colors"
            >
              Compare All Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
