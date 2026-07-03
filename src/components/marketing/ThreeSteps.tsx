"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageSquare, Sparkles, Globe } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Describe",
    description: "Tell AI about your business in one sentence",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Customize",
    description: "Edit your quiz, branding, and scoring in the visual editor",
  },
  {
    number: "03",
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
    <section ref={ref} className="py-20 sm:py-28 px-5 sm:px-8 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        <h2
          className="text-4xl sm:text-5xl font-bold text-[#0A0A0A] tracking-[-0.03em] mb-4"
          style={{ fontFamily: "var(--font-instrument-sans)" }}
        >
          How it works.
        </h2>
        <p className="text-[#6B7280] text-lg mb-16 max-w-xl mx-auto">
          Go from idea to live funnel in under 5 minutes.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 24 }}
                transition={{ duration: 0.5, delay: DELAYS[i] }}
                className="relative flex flex-col items-start text-left rounded-[28px] bg-[#FAFAF8] ring-1 ring-black/[0.04] p-7 sm:p-8 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(6,60,110,0.25)] transition-all duration-300"
              >
                <span className="text-sm font-semibold text-[#0A9AFF] mb-6 tracking-wide">
                  {step.number}
                </span>

                <div className="w-12 h-12 rounded-2xl bg-[#E5F3FF] flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-[#0A9AFF]" />
                </div>

                <h3 className="text-xl font-semibold text-[#0A0A0A] tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-[15px] text-[#6B7280] leading-relaxed">
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
