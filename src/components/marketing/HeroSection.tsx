"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";

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
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #4A90D9 0%, #6BA3E0 15%, #8BB8E8 30%, #B8D4F0 45%, #D4C5A0 60%, #E8D5B0 70%, #F0E4CD 80%, #FAFAF8 95%)",
        }}
      />

      {/* Cloud shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            top: "8%",
            left: "2%",
            width: 420,
            height: 140,
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.45) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "5%",
            left: "35%",
            width: 500,
            height: 160,
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.35) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "12%",
            right: "5%",
            width: 450,
            height: 150,
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "22%",
            left: "15%",
            width: 300,
            height: 100,
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "18%",
            right: "20%",
            width: 350,
            height: 110,
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Buildings silhouette at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          className="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,120 L0,90 L60,90 L60,70 L80,70 L80,60 L100,60 L100,70 L120,70 L120,50 L140,50 L140,70 L180,70 L180,80 L220,80 L220,55 L240,55 L240,40 L260,40 L260,55 L280,55 L280,75 L340,75 L340,60 L360,60 L360,45 L380,45 L380,35 L400,35 L400,45 L420,45 L420,65 L480,65 L480,50 L500,50 L500,30 L520,30 L520,50 L540,50 L540,70 L600,70 L600,55 L620,55 L620,40 L640,40 L640,25 L660,25 L660,40 L680,40 L680,60 L740,60 L740,45 L760,45 L760,35 L780,35 L780,20 L800,20 L800,35 L820,35 L820,50 L860,50 L860,65 L920,65 L920,50 L940,50 L940,38 L960,38 L960,28 L980,28 L980,38 L1000,38 L1000,55 L1060,55 L1060,42 L1080,42 L1080,30 L1100,30 L1100,42 L1120,42 L1120,60 L1180,60 L1180,70 L1220,70 L1220,55 L1240,55 L1240,45 L1260,45 L1260,55 L1280,55 L1280,70 L1340,70 L1340,80 L1400,80 L1400,90 L1440,90 L1440,120 Z"
            fill="rgba(0,0,0,0.06)"
          />
        </svg>
      </div>

      {/* Fade to white */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[180px]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(250,250,248,0.3) 40%, rgba(250,250,248,0.8) 70%, #FAFAF8 100%)",
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
            The AI funnel builder that
            <br />
            <span className="text-white/70">books calls</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-base sm:text-lg md:text-xl text-white/85 max-w-xl mt-5 mb-5"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.08)" }}
        >
          Describe what you need and let Qualifi handle the rest.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-1.5 mb-10 text-sm text-white/80"
        >
          <span>Build</span>
          <span className="inline-flex items-center gap-1 bg-white/15 rounded-md px-1.5 py-0.5 text-white">
            <Sparkles className="w-3 h-3" />
            Quiz Funnels
          </span>
          <span>,</span>
          <span className="inline-flex items-center gap-1 bg-white/15 rounded-md px-1.5 py-0.5 text-white">
            <Sparkles className="w-3 h-3" />
            Booking Pages
          </span>
          <span>and</span>
          <span className="inline-flex items-center gap-1 bg-white/15 rounded-md px-1.5 py-0.5 text-white">
            <Sparkles className="w-3 h-3" />
            Lead Qualifiers
          </span>
          <span>for your entire team.</span>
        </motion.div>

        {/* Floating prompt box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="relative w-full max-w-2xl"
        >
          {/* Browser mockup behind */}
          <div className="absolute -left-6 -right-6 top-10 bottom-[-50px] bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hidden md:block">
            <div className="h-8 flex items-center px-3 gap-1.5 border-b border-white/15">
              <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
              <div className="flex-1 mx-6">
                <div className="bg-white/30 rounded px-2 py-0.5 text-[10px] text-white/60 text-center w-44 mx-auto">
                  https://quiz.yoursite.com
                </div>
              </div>
              <span className="text-[10px] text-white/50 border border-white/20 rounded px-2 py-0.5">
                Publish
              </span>
            </div>
          </div>

          {/* Main prompt card */}
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-10">
            <div className="relative">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  if (!userInput) setIsFocused(false);
                }}
                rows={3}
                className="w-full px-6 py-5 text-base text-[#333333] bg-transparent resize-none outline-none placeholder-transparent"
                style={{ fontSize: "16px" }}
              />
              {!userInput && !isFocused && (
                <div className="absolute top-0 left-0 px-6 py-5 text-base text-[#A3A3A3] pointer-events-none">
                  {displayText}
                  <span className="animate-pulse">|</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-5 pb-4">
              <div className="flex items-center gap-3">
                <button className="text-[11px] text-[#A3A3A3] hover:text-[#737373] transition-colors">
                  New Suggestion
                </button>
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center text-[10px] text-emerald-600 font-medium">
                    Q
                  </div>
                  <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-[10px] text-blue-600 font-medium">
                    B
                  </div>
                  <div className="w-5 h-5 rounded bg-orange-50 flex items-center justify-center text-[10px] text-orange-600 font-medium">
                    L
                  </div>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-lg transition-all hover:brightness-95"
                style={{ backgroundColor: "#F6C744", color: "#333333" }}
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
