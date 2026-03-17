"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

function AnalyticsMockup() {
  const bars = [
    { label: "Visitors", value: 92, color: "#E5E7EB" },
    { label: "Started Quiz", value: 74, color: "#E8D5B7" },
    { label: "Completed", value: 58, color: "#D4A24E" },
    { label: "Qualified", value: 41, color: "#C4922E" },
    { label: "Booked", value: 32, color: "#B07D1E" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-semibold text-gray-800">
          Funnel Performance
        </p>
        <span className="text-xs text-gray-400">Last 30 days</span>
      </div>
      <div className="space-y-3">
        {bars.map((bar, i) => (
          <motion.div
            key={bar.label}
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
            style={{ transformOrigin: "left" }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{bar.label}</span>
              <span className="text-xs font-medium text-gray-700">
                {bar.value}%
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${bar.value}%`, backgroundColor: bar.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">Conversion rate</span>
        <span className="text-lg font-bold" style={{ color: "#D4A24E" }}>
          34.8%
        </span>
      </div>
    </motion.div>
  );
}

const bullets = [
  "Real-time funnel analytics dashboard",
  "See exactly where leads drop off",
  "Lead scoring breakdown per question",
  "Export data or connect to your CRM",
];

export function FeatureSplitB() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Mockup */}
          <div className="order-2 md:order-1">
            <AnalyticsMockup />
          </div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 md:order-2"
          >
            <p className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: "#D4A24E" }}>
              Analytics
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-6">
              Know your numbers.
              <br />
              Optimize every step.
            </h2>
            <ul className="space-y-3">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#D4A24E20" }}>
                    <Check className="w-3 h-3" style={{ color: "#D4A24E" }} />
                  </div>
                  <span className="text-sm text-gray-600 leading-relaxed">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
