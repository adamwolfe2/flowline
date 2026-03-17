"use client";

import { useInView } from "@/hooks/useInView";
import { MessageSquare, SlidersHorizontal, CalendarCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Describe your business",
    description:
      "Tell our AI about your business, ideal clients, and goals. It generates your entire funnel in seconds.",
    icon: MessageSquare,
  },
  {
    number: "02",
    title: "Customize your funnel",
    description:
      "Fine-tune questions, scoring logic, branding, and calendar routing in our visual builder.",
    icon: SlidersHorizontal,
  },
  {
    number: "03",
    title: "Publish & book calls",
    description:
      "Go live instantly on your subdomain. Qualified leads book directly onto your calendar.",
    icon: CalendarCheck,
  },
];

export function HowItWorks() {
  const { ref, inView } = useInView(0.15);

  return (
    <section id="how-it-works" className="py-24 px-6 bg-gray-50/60">
      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Section pill */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full mb-4">
            How it works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Three steps to your first funnel
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`relative bg-white border border-gray-100 rounded-2xl p-8 transition-all duration-700 ${
                  inView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Gradient top border */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-amber-400 via-amber-300 to-transparent" />

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>

                {/* Number */}
                <span className="text-xs font-bold text-amber-500 tracking-wider uppercase mb-2 block">
                  Step {step.number}
                </span>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
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
