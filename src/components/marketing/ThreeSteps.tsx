"use client";

import { MessageSquare, Sparkles, Globe } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: MessageSquare,
    title: "Describe",
    description: "Tell AI about your business in one sentence",
  },
  {
    number: 2,
    icon: Sparkles,
    title: "Customize",
    description: "Edit your quiz, branding, and scoring in the visual editor",
  },
  {
    number: 3,
    icon: Globe,
    title: "Launch",
    description: "Publish with a custom domain or embed on your site",
  },
];

export function ThreeSteps() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}
        >
          How it works
        </h2>
        <p className="text-gray-500 text-base mb-14 max-w-xl mx-auto">
          Go from idea to live funnel in under 5 minutes
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center px-4"
              >
                {/* Numbered circle */}
                <div className="w-10 h-10 rounded-full bg-[#2D6A4F] text-white text-sm font-bold flex items-center justify-center mb-4">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F]/5 border border-[#E5E7EB] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#2D6A4F]" />
                </div>

                {/* Text */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
