"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
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

const DELAYS = [0, 0.15, 0.3];

export function ThreeSteps() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 px-6 bg-white">
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

        <div className="grid grid-cols-3 gap-3 sm:gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 24 }}
                transition={{ duration: 0.5, delay: DELAYS[i] }}
                className="relative flex flex-col items-center text-center px-1 sm:px-4"
              >
                {/* Numbered circle */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#2D6A4F] text-white text-xs sm:text-sm font-bold flex items-center justify-center mb-3 sm:mb-4">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#2D6A4F]/5 border border-[#E5E7EB] flex items-center justify-center mb-3 sm:mb-4">
                  <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-[#2D6A4F]" />
                </div>

                {/* Text */}
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
