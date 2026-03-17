"use client";

import { useInView } from "@/hooks/useInView";
import { Sparkles, Palette, Globe } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Sparkles,
    title: "Describe your business",
    description: "Tell AI what you do and who you serve. It generates your headline, questions, and scoring logic.",
  },
  {
    number: "02",
    icon: Palette,
    title: "Customize everything",
    description: "Upload your logo, pick brand colors, edit questions, and connect your Cal.com calendars.",
  },
  {
    number: "03",
    icon: Globe,
    title: "Publish and book calls",
    description: "Go live on your subdomain or custom domain. Start capturing leads and booking calls instantly.",
  },
];

export function HowItWorks() {
  const { ref, inView } = useInView(0.1);

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto" ref={ref}>
        <p className="text-xs uppercase tracking-wider text-gray-400 mb-4 text-center">How it works</p>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 text-center mb-16 tracking-tight">
          Live in three steps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`bg-white border border-gray-200 rounded-xl p-6 transition-all duration-500 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-xs text-gray-300 font-mono">{step.number}</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
