"use client";

import { motion, useInView } from "framer-motion";
import { Zap } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const steps = [
  {
    num: "01",
    title: "Type what you sell",
    description:
      "One sentence is all it takes. AI writes your qualifying questions, scores every answer, and routes leads to your calendar.",
  },
  {
    num: "02",
    title: "Drop in your logo",
    description:
      "Upload your logo, pick a color. Your funnel looks like it cost $5,000 to build. It took 30 seconds.",
  },
  {
    num: "03",
    title: "Share the link, get booked",
    description:
      "Publish to your own domain. No per-lead fees. Ever.",
  },
];

const questions = [
  "What is your current revenue?",
  "How many clients do you serve?",
  "What is your biggest challenge?",
];

const answerOptions = ["Under $5k", "$5k - $20k", "$20k - $50k", "$50k+"];

function BuilderMockup() {
  const [stage, setStage] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (!isInView || hasPlayed.current) return;
    hasPlayed.current = true;

    const timers = [
      setTimeout(() => setStage(1), 600),
      setTimeout(() => setStage(2), 2000),
      setTimeout(() => setStage(3), 3200),
      setTimeout(() => setStage(4), 4500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-16 bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm"
    >
      {/* Browser chrome */}
      <div className="h-10 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-[#D4D4D4]" />
        <div className="w-3 h-3 rounded-full bg-[#D4D4D4]" />
        <div className="w-3 h-3 rounded-full bg-[#D4D4D4]" />
        <div className="flex-1 mx-8">
          <div className="bg-white rounded border border-[#E5E7EB] px-3 py-1 text-xs text-[#A3A3A3] text-center max-w-[240px] mx-auto">
            app.getmyvsl.com/builder
          </div>
        </div>
      </div>

      {/* Split view */}
      <div className="grid md:grid-cols-2 min-h-[340px]">
        {/* Left: AI Chat — messages appear one by one */}
        <div className="bg-white p-6 flex flex-col gap-3 border-r border-[#E5E7EB]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
            <span className="text-xs text-[#6B7280] font-medium">
              AI Builder
            </span>
          </div>

          {/* User message */}
          {stage >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#F9FAFB] rounded-xl px-4 py-3 border border-[#E5E7EB]"
            >
              <p className="text-sm text-[#111827]">
                Build a quiz funnel for my coaching business
              </p>
            </motion.div>
          )}

          {/* Typing indicator before "Built" */}
          {stage === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 px-4 py-3"
            >
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]"
              />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]"
              />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]"
              />
            </motion.div>
          )}

          {/* Built response */}
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#2D6A4F]/5 rounded-xl px-4 py-3 border border-[#2D6A4F]/20"
            >
              <p className="text-xs text-[#2D6A4F] font-medium mb-1">Built</p>
              <p className="text-sm text-[#6B7280]">
                3 qualifying questions, scoring rules, and calendar routing
                created.
              </p>
            </motion.div>
          )}

          {/* Generated questions list */}
          {stage >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#F9FAFB] rounded-xl px-4 py-3 border border-[#E5E7EB]"
            >
              <p className="text-xs text-[#9CA3AF] mb-2">
                Generated questions:
              </p>
              {questions.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.25 }}
                  className="flex items-center gap-2 text-xs text-[#6B7280] py-0.5"
                >
                  <span className="text-[#9CA3AF]">{i + 1}.</span> {q}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right: Live Preview — quiz UI animates in */}
        <div className="bg-[#F9FAFB] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[#A3A3A3] uppercase tracking-wider">
              Live Preview
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-500 ${stage >= 2 ? "bg-emerald-400" : "bg-[#D4D4D4]"}`}
              />
              <span className="text-[10px] text-[#A3A3A3]">
                {stage >= 2 ? "Synced" : "Waiting"}
              </span>
            </div>
          </div>

          {stage < 2 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-[#D4D4D4]">
                Waiting for AI to build...
              </p>
            </div>
          )}

          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex-1"
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-10 h-10 rounded-lg bg-[#2D6A4F]/20 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-[#2D6A4F]" />
                </div>
                <h4 className="text-sm font-semibold text-[#111827] mb-1">
                  Coaching Qualifier
                </h4>
                <p className="text-xs text-[#A3A3A3] mb-4">
                  Question 1 of 3
                </p>
              </motion.div>

              {stage >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <p className="text-sm font-medium text-[#111827] mb-3">
                    What is your current monthly revenue?
                  </p>
                </motion.div>
              )}

              {stage >= 3 && (
                <div className="space-y-2">
                  {answerOptions.map((opt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        backgroundColor:
                          stage >= 4 && i === 2
                            ? "rgba(45, 106, 79, 0.1)"
                            : "#ffffff",
                        borderColor:
                          stage >= 4 && i === 2 ? "#2D6A4F" : "#E5E7EB",
                      }}
                      transition={{
                        opacity: { delay: i * 0.1, duration: 0.25 },
                        x: { delay: i * 0.1, duration: 0.25 },
                        backgroundColor: { delay: 0, duration: 0.4 },
                        borderColor: { delay: 0, duration: 0.4 },
                      }}
                      className="text-sm px-4 py-2.5 rounded-lg border text-[#6B7280]"
                    >
                      {opt}
                      {stage >= 4 && i === 2 && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="ml-2 text-[#2D6A4F] text-xs font-medium"
                        >
                          +25 pts
                        </motion.span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
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
              <div className="h-0.5 w-16 bg-[#2D6A4F] mb-6" />
              <span className="text-sm font-semibold text-[#9CA3AF] mb-2 block">
                {step.num}
              </span>
              <h3
                className="text-xl font-semibold text-[#111827] mb-2"
                style={{ fontFamily: "var(--font-lora)" }}
              >
                {step.title}
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
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
