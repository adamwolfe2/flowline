"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { Check, ArrowRight, RotateCcw } from "lucide-react";

const DEMO_CONFIG = {
  primaryColor: "#111111",
  primaryLight: "#F5F5F5",
  questions: [
    {
      key: "q1",
      text: "What is your current monthly revenue?",
      options: [
        { id: "a", label: "Under $10k" },
        { id: "b", label: "$10k - $50k" },
        { id: "c", label: "$50k - $200k" },
        { id: "d", label: "$200k+" },
      ],
    },
    {
      key: "q2",
      text: "How do you currently get clients?",
      options: [
        { id: "a", label: "Referrals only" },
        { id: "b", label: "Some outbound" },
        { id: "c", label: "Paid ads" },
        { id: "d", label: "Multiple channels" },
      ],
    },
    {
      key: "q3",
      text: "What's your biggest growth challenge?",
      options: [
        { id: "a", label: "Not enough leads" },
        { id: "b", label: "Low close rate" },
        { id: "c", label: "Can't scale fulfillment" },
        { id: "d", label: "All of the above" },
      ],
    },
  ],
};

export function InteractiveDemo() {
  const { ref, inView } = useInView(0.05);
  const [step, setStep] = useState(0); // 0=welcome, 1-3=questions, 4=email, 5=success
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const advancing = useRef(false);

  function selectAnswer(key: string, id: string) {
    if (advancing.current) return;
    setAnswers((prev) => ({ ...prev, [key]: id }));
    advancing.current = true;
    setTimeout(() => {
      setStep((s) => s + 1);
      advancing.current = false;
    }, 350);
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setEmail("");
  }

  function renderStep() {
    if (step === 0) {
      return (
        <div className="text-center px-6 py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">See if you qualify</h3>
          <p className="text-xs text-gray-500 mb-6">Answer 3 quick questions</p>
          <button
            onClick={() => setStep(1)}
            className="bg-gray-900 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Start Quiz
          </button>
        </div>
      );
    }

    if (step >= 1 && step <= 3) {
      const q = DEMO_CONFIG.questions[step - 1];
      return (
        <div className="px-5 py-6">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Question {step} of 3</p>
          <div className="h-1 bg-gray-100 rounded-full mb-4 overflow-hidden">
            <motion.div
              className="h-1 bg-gray-900 rounded-full"
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{q.text}</h3>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const selected = answers[q.key] === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  onClick={() => selectAnswer(q.key, opt.id)}
                  className={`w-full text-left px-3 py-2.5 text-xs rounded-lg border transition-all flex items-center justify-between ${
                    selected
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className={selected ? "text-gray-900 font-medium" : "text-gray-600"}>
                    {opt.label}
                  </span>
                  {selected && <Check className="w-3 h-3 text-gray-900" />}
                </motion.button>
              );
            })}
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="px-5 py-6 text-center">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">One last step</h3>
          <p className="text-xs text-gray-500 mb-4">Enter your email to see results</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 mb-3"
            style={{ fontSize: "16px" }}
          />
          <button
            onClick={() => setStep(5)}
            className="w-full bg-gray-900 text-white text-sm py-2.5 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            See Results <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    if (step === 5) {
      return (
        <div className="px-5 py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <Check className="w-5 h-5 text-green-600" />
          </motion.div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">You qualify!</h3>
          <p className="text-xs text-gray-500 mb-4">Your calendar would appear here</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="text-[9px] text-gray-400 text-center">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </div>
              ))}
              {Array.from({ length: 28 }, (_, i) => (
                <div
                  key={i}
                  className={`text-[9px] text-center py-1 rounded ${
                    [4, 7, 11, 15, 19].includes(i)
                      ? "bg-gray-900 text-white"
                      : "text-gray-600"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={restart}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 mx-auto"
          >
            <RotateCcw className="w-3 h-3" /> Try again
          </button>
        </div>
      );
    }

    return null;
  }

  return (
    <section id="demo" className="py-24 px-6">
      <div
        className="max-w-5xl mx-auto"
        ref={ref}
      >
        <p className="text-xs uppercase tracking-wider text-gray-400 mb-4 text-center">Live demo</p>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 text-center mb-4 tracking-tight">
          See it in action
        </h2>
        <p className="text-sm text-gray-500 text-center mb-12 max-w-md mx-auto">
          This is a real, working funnel. Click through it — this is exactly what your visitors will experience.
        </p>

        <div
          className={`max-w-sm mx-auto transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Browser chrome */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="h-8 bg-gray-50 border-b border-gray-200 flex items-center px-3 gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <div className="flex-1 mx-4">
                <div className="bg-white border border-gray-200 rounded px-2 py-0.5 text-[9px] text-gray-400 text-center">
                  yourfunnel.flowline.app
                </div>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
