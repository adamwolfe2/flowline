"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Describe your business",
    description:
      "Tell Qualifi what you do in one prompt. AI writes your quiz, scoring, and calendar routing.",
  },
  {
    num: "02",
    title: "Brand it in seconds",
    description:
      "Upload your logo, pick your color. Your funnel looks native to your brand.",
  },
  {
    num: "03",
    title: "Deploy to your leads",
    description:
      "Publish to your subdomain or custom domain. No per-lead fees, ever.",
  },
];

function BuilderMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-16 bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden shadow-sm"
    >
      {/* Browser chrome */}
      <div className="h-10 bg-[#FBFBFB] border-b border-[#EBEBEB] flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-[#D4D4D4]" />
        <div className="w-3 h-3 rounded-full bg-[#D4D4D4]" />
        <div className="w-3 h-3 rounded-full bg-[#D4D4D4]" />
        <div className="flex-1 mx-8">
          <div className="bg-white rounded border border-[#EBEBEB] px-3 py-1 text-xs text-[#A3A3A3] text-center max-w-[240px] mx-auto">
            app.qualifi.com/builder
          </div>
        </div>
      </div>

      {/* Split view */}
      <div className="grid md:grid-cols-2 min-h-[340px]">
        {/* Left: AI Chat Panel */}
        <div className="bg-[#1A1A1F] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-white/50 font-medium">AI Builder</span>
          </div>
          <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
            <p className="text-sm text-white/80">
              Build a quiz funnel for my coaching business
            </p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl px-4 py-3 border border-emerald-500/20">
            <p className="text-xs text-emerald-400 font-medium mb-1">Built</p>
            <p className="text-sm text-white/70">
              5 qualifying questions, scoring rules, and calendar routing created.
            </p>
          </div>
          <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
            <p className="text-xs text-white/40 mb-2">Generated questions:</p>
            <div className="space-y-1.5">
              {[
                "What is your current revenue?",
                "How many clients do you serve?",
                "What is your biggest challenge?",
              ].map((q, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-white/60"
                >
                  <span className="text-white/30">{i + 1}.</span>
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="bg-[#FBFBFB] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[#A3A3A3] uppercase tracking-wider">
              Live Preview
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-[#A3A3A3]">Synced</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#EBEBEB] p-5 flex-1">
            <div className="w-10 h-10 rounded-lg bg-[#F6C744]/20 flex items-center justify-center mb-4">
              <span className="text-lg">&#9889;</span>
            </div>
            <h4 className="text-sm font-semibold text-[#333333] mb-1">
              Coaching Qualifier
            </h4>
            <p className="text-xs text-[#A3A3A3] mb-4">
              Question 1 of 5
            </p>
            <p className="text-sm font-medium text-[#333333] mb-3">
              What is your current monthly revenue?
            </p>
            <div className="space-y-2">
              {["Under $5k", "$5k - $20k", "$20k - $50k", "$50k+"].map(
                (opt, i) => (
                  <div
                    key={i}
                    className={`text-sm px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      i === 2
                        ? "bg-[#F6C744]/10 border-[#F6C744] text-[#333333]"
                        : "bg-white border-[#EBEBEB] text-[#737373] hover:border-[#D4D4D4]"
                    }`}
                  >
                    {opt}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              {/* Tangerine accent line */}
              <div className="h-0.5 w-16 bg-[#F9B31E] mb-6" />
              <span className="text-sm font-semibold text-[#A3A3A3] mb-2 block">
                {step.num}
              </span>
              <h3
                className="text-xl font-semibold text-[#333333] mb-2"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {step.title}
              </h3>
              <p className="text-sm text-[#737373] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <BuilderMockup />
      </div>
    </section>
  );
}
