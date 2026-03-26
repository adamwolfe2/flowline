"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Funnels Created" },
  { value: "25,000+", label: "Leads Captured" },
  { value: "60s", label: "Average Build Time" },
  { value: "3.2x", label: "More Leads vs Forms" },
];

export function StatsBar() {
  return (
    <section className="bg-[#FAFAFA] border-b border-[#E5E7EB] py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col items-center text-center"
            >
              <span
                className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight"
                style={{ fontFamily: "var(--font-plus-jakarta)" }}
              >
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm text-[#6B7280] mt-1.5 font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
