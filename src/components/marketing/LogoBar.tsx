"use client";

import { motion } from "framer-motion";

const logos = [
  "ScaleUp",
  "CoachOS",
  "LeadVault",
  "ClientFlow",
  "BookedOut",
  "FunnelPro",
];

export function LogoBar() {
  return (
    <section className="bg-white border-b border-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-8">
          Trusted by fast-growing teams
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4"
        >
          {logos.map((name) => (
            <span
              key={name}
              className="text-lg font-bold tracking-tight text-gray-300 select-none font-[family-name:var(--font-sora)]"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
