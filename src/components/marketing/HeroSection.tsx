"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";

const PROMPTS = [
  "I sell business coaching to 6-figure entrepreneurs...",
  "I run a marketing agency for e-commerce brands...",
  "I offer fitness programs for busy professionals...",
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
        const timeout = setTimeout(
          () => setDisplayText(currentPrompt.slice(0, displayText.length + 1)),
          40
        );
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setIsTyping(false), 2500);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayText.length > 0) {
        const timeout = setTimeout(
          () => setDisplayText(displayText.slice(0, -1)),
          20
        );
        return () => clearTimeout(timeout);
      } else {
        setPromptIndex((i) => (i + 1) % PROMPTS.length);
        setIsTyping(true);
      }
    }
  }, [displayText, isTyping, promptIndex, isFocused, userInput]);

  useEffect(() => {
    return typewriter();
  }, [typewriter]);

  function handleSubmit() {
    const prompt = userInput || displayText;
    router.push(
      prompt.length > 5
        ? `/onboarding?prompt=${encodeURIComponent(prompt)}`
        : "/onboarding"
    );
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: "clamp(720px, 80vh, 778px)" }}
    >
      {/* Forest background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/hero-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      />

      {/* Light transparent fade — NO darkening, just blend to page bg at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, transparent 0%, transparent 50%, rgba(255,255,255,0.4) 70%, rgba(255,255,255,0.85) 85%, #FFFFFF 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-28 md:pt-32 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="text-[48px] sm:text-[56px] md:text-[68px] font-semibold leading-none text-white"
            style={{
              fontFamily: "var(--font-outfit)",
              textShadow: "0 2px 24px rgba(0,0,0,0.12)",
            }}
          >
            Your VSL funnel.
            <br />
            <span className="text-white/70">Built in 60 seconds.</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-base sm:text-lg md:text-xl text-white/85 max-w-xl mt-5 mb-5"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.08)" }}
        >
          Describe your product in one sentence. AI generates the questions, scoring, and booking flow. You're live in minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-1.5 mb-10 text-sm text-white/80"
        >
          <span className="inline-flex items-center bg-white/15 rounded-md px-1.5 py-0.5 text-white">
            No code.
          </span>
          <span className="inline-flex items-center bg-white/15 rounded-md px-1.5 py-0.5 text-white">
            No designer.
          </span>
          <span className="inline-flex items-center bg-white/15 rounded-md px-1.5 py-0.5 text-white">
            No agency.
          </span>
        </motion.div>

        {/* Floating prompt box + wide browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="relative w-full max-w-2xl"
        >
          {/* WIDE browser mockup — spans far beyond the prompt box */}
          <div
            className="absolute top-10 hidden md:block"
            style={{
              left: "calc(-50vw + 50%)",
              right: "calc(-50vw + 50%)",
              bottom: "-60px",
            }}
          >
            <div className="max-w-6xl mx-auto">
              <div className="bg-white/25 backdrop-blur-[2px] rounded-2xl border border-white/20 shadow-lg overflow-hidden">
                <div className="h-9 flex items-center px-4 gap-2 border-b border-white/10">
                  {/* Browser chrome left */}
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-xs">‹</span>
                    <span className="text-white/30 text-xs">›</span>
                    <span className="text-white/30 text-xs">⟨/⟩</span>
                  </div>
                  <div className="flex-1 mx-8">
                    <div className="bg-white/20 rounded-md px-3 py-1 text-[11px] text-white/50 text-center max-w-xs mx-auto flex items-center justify-center gap-1.5">
                      https://yoursite.com
                    </div>
                  </div>
                  {/* Browser chrome right */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-white/50 border border-white/20 rounded-md px-3 py-1 bg-white/5">
                      Publish
                    </span>
                    <span className="text-white/30 text-xs">▫</span>
                    <span className="text-white/30 text-xs">⚙</span>
                  </div>
                </div>
                {/* Empty content area — the prompt card sits on top */}
                <div className="h-[180px]" />
              </div>
            </div>
          </div>

          {/* Main prompt card — centered, on top of browser mockup */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10">
            <div className="relative">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  if (!userInput) setIsFocused(false);
                }}
                rows={3}
                className="w-full px-6 py-5 text-base text-[#111827] bg-transparent resize-none outline-none placeholder-transparent"
                style={{ fontSize: "16px" }}
              />
              {!userInput && !isFocused && (
                <div className="absolute top-0 left-0 px-6 py-5 text-base text-[#A3A3A3] pointer-events-none">
                  {displayText}
                  <span className="animate-pulse">|</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end px-5 pb-4">
              <div className="flex items-center">
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-1.5 text-sm font-semibold pl-5 pr-3 py-2.5 rounded-l-lg transition-all hover:brightness-95"
                  style={{ backgroundColor: "#2D6A4F", color: "#ffffff" }}
                >
                  Build it
                </button>
                <button
                  className="flex items-center pl-2.5 pr-3 py-2.5 rounded-r-lg border-l border-[#245840] transition-all hover:brightness-95"
                  style={{ backgroundColor: "#2D6A4F", color: "#ffffff" }}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
