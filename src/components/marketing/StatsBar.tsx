"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Funnels created" },
  { value: "25,000+", label: "Leads captured" },
  { value: "60s", label: "Average build time" },
  { value: "3.2x", label: "More leads vs forms" },
];

export function StatsBar() {
  return (
    <section className="bg-white py-14 sm:py-20 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
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
                className="text-4xl sm:text-5xl font-bold text-[#0A0A0A] tracking-[-0.03em]"
                style={{ fontFamily: "var(--font-instrument-sans)" }}
              >
                {stat.value}
              </span>
              <span className="text-sm sm:text-base text-[#6B7280] mt-2">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
