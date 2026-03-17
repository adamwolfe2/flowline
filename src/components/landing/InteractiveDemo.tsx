"use client";

import { useState, useCallback } from "react";
import { useInView } from "@/hooks/useInView";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Calendar, ArrowRight, ChevronRight } from "lucide-react";

/* ─── Demo config ─── */
const demoQuestions = [
  {
    key: "revenue",
    text: "What's your monthly revenue?",
    options: [
      { id: "r1", label: "Under $10k/mo" },
      { id: "r2", label: "$10k - $50k/mo" },
      { id: "r3", label: "$50k - $250k/mo" },
      { id: "r4", label: "$250k+/mo" },
    ],
  },
  {
    key: "clients",
    text: "How do you get clients today?",
    options: [
      { id: "c1", label: "Referrals only" },
      { id: "c2", label: "Social media & content" },
      { id: "c3", label: "Paid ads" },
      { id: "c4", label: "Cold outreach" },
    ],
  },
  {
    key: "challenge",
    text: "What's your biggest growth challenge?",
    options: [
      { id: "g1", label: "Not enough leads" },
      { id: "g2", label: "Low lead quality" },
      { id: "g3", label: "No-shows on calls" },
      { id: "g4", label: "Can't scale what works" },
    ],
  },
];

const BRAND_COLOR = "#F59E0B"; // amber-500
const BRAND_LIGHT = "#FEF3C7"; // amber-100

/* ─── Sub-components ─── */

function DemoWelcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-8">
      <div className="inline-flex items-center justify-center bg-amber-50 rounded-2xl border border-amber-100 px-5 py-2.5 mb-6">
        <span className="text-sm font-bold text-amber-700">GrowthCo</span>
      </div>
      <div className="inline-block text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full mb-3 bg-amber-50 text-amber-600">
        Free Application
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2 leading-snug">
        See if you qualify for our growth program
      </h2>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        Answer 3 quick questions and book your strategy call.
      </p>
      <button
        onClick={onStart}
        className="w-full max-w-xs py-3 px-6 rounded-xl text-white font-semibold text-sm shadow-md transition-all hover:shadow-lg"
        style={{ backgroundColor: BRAND_COLOR }}
      >
        Take the Quiz — 30 Seconds
      </button>
      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
        <span>No spam</span>
        <span className="w-1 h-1 bg-gray-300 rounded-full" />
        <span>100% free</span>
      </div>
    </div>
  );
}

function DemoQuestion({
  question,
  qNum,
  total,
  onSelect,
}: {
  question: (typeof demoQuestions)[0];
  qNum: number;
  total: number;
  onSelect: (optId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (optId: string) => {
    setSelected(optId);
    setTimeout(() => onSelect(optId), 400);
  };

  return (
    <div className="px-6 py-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
        Question {qNum} of {total}
      </p>
      <h3 className="text-lg font-semibold text-gray-900 mb-5">{question.text}</h3>
      <div className="flex flex-col gap-2.5">
        {question.options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className="w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 flex items-center justify-between"
              style={{
                borderColor: isSelected ? BRAND_COLOR : "#E5E7EB",
                backgroundColor: isSelected ? BRAND_LIGHT : "#FFFFFF",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    borderColor: isSelected ? BRAND_COLOR : "#D1D5DB",
                    backgroundColor: isSelected ? BRAND_COLOR : "transparent",
                  }}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: isSelected ? "#92400E" : "#374151" }}
                >
                  {opt.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DemoEmail({ onSubmit }: { onSubmit: () => void }) {
  const [email, setEmail] = useState("");

  return (
    <div className="px-6 py-8 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
        <Check className="w-6 h-6 text-amber-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">Great match!</h3>
      <p className="text-sm text-gray-500 mb-6">
        Enter your email to see your results and book a call.
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3 outline-none focus:border-amber-400 transition-colors"
      />
      <button
        onClick={onSubmit}
        className="w-full py-3 px-6 rounded-xl text-white font-semibold text-sm shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
        style={{ backgroundColor: BRAND_COLOR }}
      >
        See my results
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function DemoSuccess({ onReset }: { onReset: () => void }) {
  // Mock calendar
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const times = ["9:00 AM", "10:30 AM", "2:00 PM"];

  return (
    <div className="px-6 py-6 text-center">
      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-green-50 flex items-center justify-center">
        <Calendar className="w-5 h-5 text-green-600" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">
        You qualified for a Strategy Call
      </h3>
      <p className="text-xs text-gray-500 mb-4">Pick a time that works for you</p>

      {/* Mini calendar mock */}
      <div className="bg-gray-50 rounded-xl p-3 mb-4 text-left">
        <div className="grid grid-cols-5 gap-1 mb-2">
          {days.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-gray-400">
              {d}
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {times.map((time, ti) => (
            <div key={time} className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400 w-14 flex-shrink-0">{time}</span>
              <div className="flex-1 grid grid-cols-5 gap-1">
                {days.map((d, di) => {
                  const isHighlighted = (ti + di) % 3 !== 0;
                  return (
                    <div
                      key={`${d}-${time}`}
                      className={`h-5 rounded text-[9px] flex items-center justify-center font-medium ${
                        isHighlighted
                          ? "bg-amber-100 text-amber-700 cursor-pointer hover:bg-amber-200 transition-colors"
                          : "bg-gray-100 text-gray-300"
                      }`}
                    >
                      {isHighlighted ? <ChevronRight className="w-2.5 h-2.5" /> : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
      >
        Restart demo
      </button>
    </div>
  );
}

/* ─── Progress bar ─── */
function DemoProgress({ step, total }: { step: number; total: number }) {
  // total steps: welcome(0), q1(1), q2(2), q3(3), email(4), success(5)
  const pct = Math.min((step / (total + 2)) * 100, 100);
  return (
    <div className="h-1 bg-gray-100 rounded-full overflow-hidden mx-6 mt-4">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, backgroundColor: BRAND_COLOR }}
      />
    </div>
  );
}

/* ─── Main demo component ─── */
export function InteractiveDemo() {
  const { ref, inView } = useInView(0.1);
  const [step, setStep] = useState(0);
  // 0=welcome, 1-3=questions, 4=email, 5=success
  const totalQ = demoQuestions.length;
  const emailStep = totalQ + 1;
  const successStep = totalQ + 2;

  const handleStart = useCallback(() => setStep(1), []);
  const handleAnswer = useCallback(() => {
    setStep((s) => s + 1);
  }, []);
  const handleEmailSubmit = useCallback(() => {
    setStep(successStep);
  }, [successStep]);
  const handleReset = useCallback(() => setStep(0), []);

  const currentQ = step >= 1 && step <= totalQ ? demoQuestions[step - 1] : null;

  return (
    <section id="demo" className="py-24 px-6">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-medium bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full mb-4">
            Live demo
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            See it in action
          </h2>
          <p className="text-lg text-gray-500">
            A real funnel, running live. Try it.
          </p>
        </div>

        {/* Phone frame container */}
        <div
          className={`max-w-sm mx-auto transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Phone frame */}
          <div className="relative bg-gray-950 rounded-[2.5rem] p-3 shadow-2xl shadow-gray-300/50">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-950 rounded-b-2xl z-10" />

            {/* Screen */}
            <div className="bg-white rounded-[2rem] overflow-hidden min-h-[480px] relative">
              <DemoProgress step={step} total={totalQ} />

              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <DemoWelcome onStart={handleStart} />
                  </motion.div>
                )}

                {currentQ && (
                  <motion.div
                    key={`q-${step}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <DemoQuestion
                      question={currentQ}
                      qNum={step}
                      total={totalQ}
                      onSelect={handleAnswer}
                    />
                  </motion.div>
                )}

                {step === emailStep && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <DemoEmail onSubmit={handleEmailSubmit} />
                  </motion.div>
                )}

                {step === successStep && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <DemoSuccess onReset={handleReset} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
