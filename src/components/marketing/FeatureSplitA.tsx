"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

function QuizMockup() {
  const questions = [
    {
      q: "What's your monthly ad spend?",
      opts: ["Under $5k", "$5k-$20k", "$20k+"],
      active: false,
    },
    {
      q: "What's your biggest bottleneck?",
      opts: ["Lead quality", "Show rate", "Close rate"],
      active: true,
    },
    {
      q: "How many calls do you book per week?",
      opts: ["0-5", "5-15", "15+"],
      active: false,
    },
  ];

  return (
    <div className="space-y-3">
      {questions.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
          className={`rounded-xl p-5 border ${
            item.active
              ? "bg-white/10 border-indigo-500/40"
              : "bg-white/5 border-white/10"
          }`}
        >
          <p
            className={`text-sm font-medium mb-3 ${
              item.active ? "text-white" : "text-gray-400"
            }`}
          >
            {item.q}
          </p>
          <div className="flex flex-wrap gap-2">
            {item.opts.map((opt, j) => (
              <span
                key={j}
                className={`text-xs px-3 py-1.5 rounded-lg ${
                  item.active && j === 1
                    ? "bg-indigo-500 text-white"
                    : "bg-white/8 text-gray-400 border border-white/10"
                }`}
              >
                {opt}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const bullets = [
  "Visual drag-and-drop quiz builder",
  "Custom scoring per answer choice",
  "Conditional logic branching",
  "Embeddable on any page or domain",
];

export function FeatureSplitA() {
  return (
    <section id="features" className="bg-[#111111] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-3">
              Quiz Builder
            </p>
            <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">
              Ask the right questions.
              <br />
              Filter the wrong leads.
            </h2>
            <ul className="space-y-3">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-300 leading-relaxed">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Mockup */}
          <div>
            <QuizMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
