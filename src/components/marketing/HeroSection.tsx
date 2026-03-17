"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const PROMPTS = [
  "create a quiz funnel for my coaching business",
  "build a lead qualifier for my SaaS agency",
  "make a booking funnel for my real estate team",
];

export function HeroSection() {
  const router = useRouter();
  const [displayText, setDisplayText] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const typewriter = useCallback(() => {
    if (isFocused || userInput) return;
    const currentPrompt = PROMPTS[promptIndex];
    if (isTyping) {
      if (displayText.length < currentPrompt.length) {
        const timeout = setTimeout(() => setDisplayText(currentPrompt.slice(0, displayText.length + 1)), 40);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setIsTyping(false), 2500);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayText.length > 0) {
        const timeout = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 20);
        return () => clearTimeout(timeout);
      } else {
        setPromptIndex((i) => (i + 1) % PROMPTS.length);
        setIsTyping(true);
      }
    }
  }, [displayText, isTyping, promptIndex, isFocused, userInput]);

  useEffect(() => { return typewriter(); }, [typewriter]);

  function handleSubmit() {
    const prompt = userInput || displayText;
    router.push(prompt.length > 5 ? `/onboarding?prompt=${encodeURIComponent(prompt)}` : "/onboarding");
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Sky gradient background */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #5B9BD5 0%, #7BB8E0 15%, #A8D4E8 30%, #C8E2EE 45%, #E8D5B7 65%, #F0E4CD 80%, #F5EDE0 90%, #FAFAF8 100%)",
      }} />

      {/* Subtle cloud-like shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[300px] h-[120px] bg-white/30 rounded-full blur-3xl" />
        <div className="absolute top-[15%] right-[10%] w-[400px] h-[150px] bg-white/25 rounded-full blur-3xl" />
        <div className="absolute top-[5%] left-[40%] w-[350px] h-[100px] bg-white/20 rounded-full blur-3xl" />
        <div className="absolute top-[25%] left-[20%] w-[250px] h-[80px] bg-white/15 rounded-full blur-3xl" />
        <div className="absolute top-[20%] right-[25%] w-[300px] h-[100px] bg-white/20 rounded-full blur-3xl" />
      </div>

      {/* Fade to white at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[200px]" style={{
        background: "linear-gradient(180deg, transparent 0%, rgba(250,250,248,0.3) 40%, rgba(250,250,248,0.8) 70%, #FAFAF8 100%)",
      }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 pt-24 pb-32 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-4" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.1)" }}>
            The AI funnel builder that
            <br />
            <span style={{ color: "#D4A24E" }}>books calls</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-base md:text-lg text-white/80 max-w-xl mx-auto mb-4"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.08)" }}
        >
          Describe what you need and let Qualifi handle the rest.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          <span className="text-white/70 text-sm">Build</span>
          <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">Quiz Funnels</span>
          <span className="text-white/70 text-sm">,</span>
          <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">Booking Pages</span>
          <span className="text-white/70 text-sm">and</span>
          <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">Lead Qualifiers</span>
        </motion.div>

        {/* Floating prompt box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="relative max-w-2xl mx-auto"
        >
          {/* Browser mockup behind */}
          <div className="absolute -left-8 -right-8 top-12 bottom-[-60px] bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hidden md:block">
            <div className="h-8 flex items-center px-3 gap-1.5 border-b border-gray-200/30">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300/60" />
              <div className="flex-1 mx-6">
                <div className="bg-white/50 rounded px-2 py-0.5 text-[10px] text-gray-400 text-center w-40 mx-auto">https://yoursite.com</div>
              </div>
              <span className="text-[10px] text-gray-400 border border-gray-300/40 rounded px-2 py-0.5">Publish</span>
            </div>
          </div>

          {/* Main prompt textarea card */}
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden z-10">
            <div className="relative">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => { if (!userInput) setIsFocused(false); }}
                rows={4}
                className="w-full px-6 py-5 text-base text-gray-900 bg-transparent resize-none outline-none"
                style={{ fontSize: "16px" }}
              />
              {!userInput && !isFocused && (
                <div className="absolute top-0 left-0 px-6 py-5 text-base text-gray-400 pointer-events-none">
                  {displayText}<span className="animate-pulse">|</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-5 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-gray-400">New Suggestion</span>
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded bg-green-100 flex items-center justify-center text-[10px]">Q</div>
                  <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-[10px]">B</div>
                  <div className="w-5 h-5 rounded bg-orange-100 flex items-center justify-center text-[10px]">L</div>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: "#D4A24E", color: "white" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#C4922E")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D4A24E")}
              >
                Build it
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
