"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

const DEMO_STEPS = [
  { label: "Analyzing business...", delay: 800 },
  { label: "Generating quiz questions...", delay: 1200 },
  { label: "Building lead scoring...", delay: 1000 },
  { label: "Setting up calendar routing...", delay: 800 },
];

const DEMO_QUIZ = {
  headline: "Find Your Perfect Growth Strategy",
  badge: "FREE ASSESSMENT",
  questions: [
    { text: "What stage is your business?", options: ["Just starting out", "Growing steadily", "Ready to scale"] },
    { text: "What is your biggest challenge?", options: ["Getting leads", "Converting leads", "Retaining clients"] },
    { text: "What is your monthly revenue?", options: ["Under $10K", "$10K-$50K", "$50K+"] },
  ],
};

export function HeroSection() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(-1);
  const [demoQuizStep, setDemoQuizStep] = useState(-1);
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [isAutoTyping, setIsAutoTyping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoStarted = useRef(false);

  const startDemo = useCallback(() => {
    setDemoActive(true);
    setDemoStep(0);
    let accDelay = 0;
    DEMO_STEPS.forEach((s, i) => {
      accDelay += s.delay;
      timeoutRef.current = setTimeout(() => setDemoStep(i + 1), accDelay);
    });
    accDelay += 600;
    timeoutRef.current = setTimeout(() => setDemoQuizStep(0), accDelay);
    accDelay += 1500;
    timeoutRef.current = setTimeout(() => setSelectedAnswer(1), accDelay);
    accDelay += 800;
    timeoutRef.current = setTimeout(() => { setDemoQuizStep(1); setSelectedAnswer(-1); }, accDelay);
    accDelay += 1200;
    timeoutRef.current = setTimeout(() => setSelectedAnswer(0), accDelay);
    accDelay += 800;
    timeoutRef.current = setTimeout(() => { setDemoQuizStep(2); setSelectedAnswer(-1); }, accDelay);
    accDelay += 1200;
    timeoutRef.current = setTimeout(() => setSelectedAnswer(2), accDelay);
    accDelay += 800;
    timeoutRef.current = setTimeout(() => setDemoQuizStep(3), accDelay);
  }, []);

  useEffect(() => {
    if (demoStarted.current) return;
    demoStarted.current = true;
    const targetText = "I sell business coaching to 6-figure entrepreneurs";
    const delay = setTimeout(() => {
      setIsAutoTyping(true);
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i <= targetText.length) {
          setPrompt(targetText.slice(0, i));
          i++;
        } else {
          clearInterval(typeInterval);
          setIsAutoTyping(false);
          setTimeout(() => startDemo(), 600);
        }
      }, 35);
      return () => clearInterval(typeInterval);
    }, 1000);
    return () => clearTimeout(delay);
  }, [startDemo]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  function handleSubmit() {
    if (prompt.length > 5) {
      router.push(`/build?prompt=${encodeURIComponent(prompt)}`);
    } else {
      router.push("/build");
    }
  }

  return (
    <section className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-36 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT: Headline + CTA */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]"
            >
              <span className="text-[#111827]">Describe your business.</span>
              <br />
              <span className="text-[#2D6A4F]">Get a funnel in 60 seconds.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg text-[#6B7280] leading-relaxed max-w-lg"
            >
              AI builds your quiz, scores your leads, and routes them to the right calendar. No code. No design skills. Just results.
            </motion.p>

            {/* Prompt input */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8"
            >
              <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <textarea
                  value={prompt}
                  onChange={(e) => { if (!isAutoTyping) setPrompt(e.target.value); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                  placeholder="Describe your business in one sentence..."
                  rows={2}
                  className="w-full px-4 py-3.5 text-[15px] text-[#111827] placeholder-[#9CA3AF] bg-transparent resize-none outline-none border-none focus:ring-0"
                  aria-label="Describe your business to generate a funnel"
                />
                <div className="flex items-center justify-between px-4 pb-3">
                  <span className="text-xs text-[#9CA3AF]">No account required</span>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg bg-[#2D6A4F] text-white hover:bg-[#245840] transition-colors"
                  >
                    Build my funnel
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-3">
                Free to start. No credit card required.
              </p>
            </motion.div>
          </div>

          {/* RIGHT: Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#F3F4F6] bg-[#FAFAFA]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FCA5A5]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FCD34D]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#86EFAC]" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="bg-white border border-[#E5E7EB] rounded-md px-3 py-1 text-[10px] text-[#9CA3AF] text-center font-mono">
                    getmyvsl.com/f/your-funnel
                  </div>
                </div>
              </div>

              {/* Demo content */}
              <div className="p-8 min-h-[380px] flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {demoQuizStep < 0 ? (
                    <motion.div
                      key="building"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full"
                    >
                      {demoActive ? (
                        <div className="space-y-3 max-w-xs mx-auto">
                          {DEMO_STEPS.map((s, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: demoStep > i ? 1 : demoStep === i ? 0.6 : 0.2, x: 0 }}
                              transition={{ delay: 0.05 * i }}
                              className="flex items-center gap-2.5"
                            >
                              {demoStep > i ? (
                                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] flex-shrink-0" />
                              ) : demoStep === i ? (
                                <div className="w-4 h-4 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-[#E5E7EB] flex-shrink-0" />
                              )}
                              <span className={`text-sm ${demoStep > i ? "text-[#2D6A4F] font-medium" : "text-[#9CA3AF]"}`}>
                                {s.label}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#2D6A4F]/10 flex items-center justify-center mb-4">
                            <Sparkles className="w-7 h-7 text-[#2D6A4F]" />
                          </div>
                          <p className="text-sm font-medium text-[#374151]">Your funnel preview</p>
                          <p className="text-xs text-[#9CA3AF] mt-1">Watch AI build it live</p>
                        </div>
                      )}
                    </motion.div>
                  ) : demoQuizStep < 3 ? (
                    <motion.div
                      key={`q-${demoQuizStep}`}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2 }}
                      className="w-full max-w-sm mx-auto"
                    >
                      {demoQuizStep === 0 && (
                        <div className="text-center mb-6">
                          <span className="inline-block text-[10px] font-semibold tracking-wider uppercase text-[#2D6A4F] bg-[#2D6A4F]/10 px-3 py-1 rounded-full mb-3">
                            {DEMO_QUIZ.badge}
                          </span>
                          <h3 className="text-lg font-bold text-[#111827]">{DEMO_QUIZ.headline}</h3>
                        </div>
                      )}
                      <p className="text-[10px] text-[#9CA3AF] mb-2">Question {demoQuizStep + 1} of {DEMO_QUIZ.questions.length}</p>
                      <p className="text-sm font-medium text-[#111827] mb-4">{DEMO_QUIZ.questions[demoQuizStep].text}</p>
                      <div className="space-y-2">
                        {DEMO_QUIZ.questions[demoQuizStep].options.map((opt, oi) => (
                          <motion.div
                            key={oi}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 + oi * 0.06 }}
                            className={`px-4 py-3 rounded-xl border text-sm transition-all ${
                              selectedAnswer === oi
                                ? "border-[#2D6A4F] bg-[#2D6A4F]/5 text-[#2D6A4F] font-medium"
                                : "border-[#E5E7EB] text-[#374151]"
                            }`}
                          >
                            {opt}
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-5 h-1 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#2D6A4F] rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${((demoQuizStep + 1) / DEMO_QUIZ.questions.length) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 mx-auto rounded-full bg-[#2D6A4F]/10 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-6 h-6 text-[#2D6A4F]" />
                      </div>
                      <p className="text-sm font-bold text-[#111827]">Lead captured &amp; scored</p>
                      <p className="text-xs text-[#6B7280] mt-1">Score: 87/100 — High tier</p>
                      <div className="inline-block bg-[#2D6A4F] text-white text-xs font-semibold px-6 py-2.5 rounded-xl mt-4">
                        Routed to VIP Calendar
                      </div>
                      <p className="text-[10px] text-[#9CA3AF] mt-4">This is exactly what your leads will see</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
