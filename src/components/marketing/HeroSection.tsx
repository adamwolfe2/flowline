"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Zap, BarChart3, Calendar, CheckCircle2 } from "lucide-react";

const DEMO_PROMPTS = [
  "I sell business coaching to 6-figure entrepreneurs",
  "I run a digital marketing agency for ecommerce brands",
  "I help first-time home buyers find properties",
];

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

    // Step through the build phases
    let accDelay = 0;
    DEMO_STEPS.forEach((s, i) => {
      accDelay += s.delay;
      timeoutRef.current = setTimeout(() => setDemoStep(i + 1), accDelay);
    });

    // After build completes, show the quiz preview
    accDelay += 600;
    timeoutRef.current = setTimeout(() => {
      setDemoQuizStep(0);
    }, accDelay);

    // Auto-advance through quiz
    accDelay += 1500;
    timeoutRef.current = setTimeout(() => { setSelectedAnswer(1); }, accDelay);
    accDelay += 800;
    timeoutRef.current = setTimeout(() => { setDemoQuizStep(1); setSelectedAnswer(-1); }, accDelay);
    accDelay += 1200;
    timeoutRef.current = setTimeout(() => { setSelectedAnswer(0); }, accDelay);
    accDelay += 800;
    timeoutRef.current = setTimeout(() => { setDemoQuizStep(2); setSelectedAnswer(-1); }, accDelay);
    accDelay += 1200;
    timeoutRef.current = setTimeout(() => { setSelectedAnswer(2); }, accDelay);
    accDelay += 800;
    timeoutRef.current = setTimeout(() => { setDemoQuizStep(3); }, accDelay); // success
  }, []);

  // Auto-type demo prompt on first load
  useEffect(() => {
    if (demoStarted.current) return;
    demoStarted.current = true;
    const targetText = DEMO_PROMPTS[0];
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
    }, 1200);
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
    <section className="relative overflow-hidden bg-[#FAFBFC]">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F0FDF4]/30 to-white" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#10B981]/8 via-transparent to-transparent rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-20 sm:pb-28">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20">
            <Zap className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-xs font-medium text-[#059669]">AI-powered quiz funnels</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-center text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#111827] leading-[1.1]"
        >
          Describe your business.
          <br />
          <span className="bg-gradient-to-r from-[#059669] to-[#10B981] bg-clip-text text-transparent">
            Get a funnel in 60 seconds.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-center text-base sm:text-lg text-[#6B7280] mt-5 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          AI builds your quiz, scores your leads, and routes them to the right calendar.
          No code. No design skills. Just results.
        </motion.p>

        {/* Two-column: Prompt + Live Demo */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto"
        >
          {/* Left: Prompt input + build progress */}
          <div className="flex flex-col">
            <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] overflow-hidden flex-1 flex flex-col">
              {/* Mini toolbar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F3F4F6] bg-[#FAFAFA]">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                <span className="text-xs font-medium text-[#374151]">AI Funnel Builder</span>
              </div>

              <div className="flex-1 flex flex-col p-5">
                <textarea
                  value={prompt}
                  onChange={(e) => { if (!isAutoTyping) setPrompt(e.target.value); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                  placeholder="Describe your business in one sentence..."
                  rows={3}
                  className="w-full text-[15px] text-[#111827] placeholder-[#9CA3AF] bg-transparent resize-none outline-none border-none focus:ring-0 flex-1"
                  aria-label="Describe your business to generate a funnel"
                />

                {/* Build progress indicators */}
                <AnimatePresence>
                  {demoActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 space-y-2"
                    >
                      {DEMO_STEPS.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: demoStep > i ? 1 : demoStep === i ? 0.7 : 0.3, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className="flex items-center gap-2"
                        >
                          {demoStep > i ? (
                            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                          ) : demoStep === i ? (
                            <div className="w-4 h-4 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-[#E5E7EB]" />
                          )}
                          <span className={`text-xs ${demoStep > i ? "text-[#059669] font-medium" : "text-[#9CA3AF]"}`}>
                            {s.label}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-[#F3F4F6]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#9CA3AF]">
                    <BarChart3 className="w-3 h-3" /> Lead scoring
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#9CA3AF]">
                    <Calendar className="w-3 h-3" /> Calendar routing
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 text-sm font-semibold pl-5 pr-4 py-2.5 rounded-xl bg-[#111827] text-white hover:bg-[#1F2937] transition-colors shadow-sm"
                >
                  Build it
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-[#9CA3AF] mt-3 text-center">
              Free to start. No account required to build.
            </p>
          </div>

          {/* Right: Live demo preview */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#F3F4F6] bg-[#FAFAFA]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FCA5A5]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FCD34D]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#86EFAC]" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-[#F3F4F6] rounded-md px-3 py-1 text-[10px] text-[#9CA3AF] text-center font-mono">
                  getmyvsl.com/f/your-funnel
                </div>
              </div>
            </div>

            {/* Quiz preview area */}
            <div className="p-6 sm:p-8 min-h-[360px] flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {demoQuizStep < 0 ? (
                  /* Waiting / Building state */
                  <motion.div
                    key="building"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center"
                  >
                    {demoActive ? (
                      <div className="space-y-4">
                        <div className="w-10 h-10 mx-auto border-2 border-[#E5E7EB] border-t-[#10B981] rounded-full animate-spin" />
                        <p className="text-sm text-[#6B7280]">Building your funnel...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-[#10B981]" />
                        </div>
                        <p className="text-sm font-medium text-[#374151]">Your funnel preview will appear here</p>
                        <p className="text-xs text-[#9CA3AF]">Type a prompt and watch AI build it live</p>
                      </div>
                    )}
                  </motion.div>
                ) : demoQuizStep < 3 ? (
                  /* Quiz question */
                  <motion.div
                    key={`q-${demoQuizStep}`}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-sm"
                  >
                    {demoQuizStep === 0 && (
                      <div className="text-center mb-6">
                        <span className="inline-block text-[10px] font-semibold tracking-wider uppercase text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full mb-3">
                          {DEMO_QUIZ.badge}
                        </span>
                        <h3 className="text-lg font-bold text-[#111827]">{DEMO_QUIZ.headline}</h3>
                      </div>
                    )}

                    <div className="mb-2">
                      <span className="text-[10px] text-[#9CA3AF]">Question {demoQuizStep + 1} of {DEMO_QUIZ.questions.length}</span>
                    </div>
                    <p className="text-sm font-medium text-[#111827] mb-4">
                      {DEMO_QUIZ.questions[demoQuizStep].text}
                    </p>
                    <div className="space-y-2">
                      {DEMO_QUIZ.questions[demoQuizStep].options.map((opt, oi) => (
                        <motion.div
                          key={oi}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + oi * 0.08 }}
                          className={`px-4 py-3 rounded-xl border text-sm cursor-default transition-all ${
                            selectedAnswer === oi
                              ? "border-[#10B981] bg-[#10B981]/10 text-[#059669] font-medium"
                              : "border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB]"
                          }`}
                        >
                          {opt}
                        </motion.div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-6 h-1 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((demoQuizStep + 1) / DEMO_QUIZ.questions.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                ) : (
                  /* Success state */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#10B981]/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111827]">Lead captured &amp; scored</p>
                      <p className="text-xs text-[#6B7280] mt-1">Score: 87/100 — High tier</p>
                    </div>
                    <div className="inline-block bg-[#10B981] text-white text-xs font-semibold px-6 py-2.5 rounded-xl">
                      Routed to VIP Calendar
                    </div>
                    <p className="text-[10px] text-[#9CA3AF]">This is exactly what your leads will see</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Bottom feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-10"
        >
          {[
            { icon: <Sparkles className="w-3.5 h-3.5" />, text: "AI-Generated Quizzes" },
            { icon: <BarChart3 className="w-3.5 h-3.5" />, text: "Lead Scoring" },
            { icon: <Calendar className="w-3.5 h-3.5" />, text: "Calendar Routing" },
          ].map((pill) => (
            <div
              key={pill.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-[#374151] shadow-sm"
            >
              <span className="text-[#10B981]">{pill.icon}</span>
              {pill.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
