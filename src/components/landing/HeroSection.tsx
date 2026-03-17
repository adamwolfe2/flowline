"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const PROMPTS = [
  "A quiz funnel for my SaaS consulting agency that qualifies leads by revenue...",
  "A lead qualifier for my coaching business that books discovery calls...",
  "A booking funnel for my agency that routes hot leads to senior reps...",
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
        const timeout = setTimeout(() => {
          setDisplayText(currentPrompt.slice(0, displayText.length + 1));
        }, 35);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setIsTyping(false), 2500);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 15);
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
    if (prompt.length > 5) {
      router.push(`/onboarding?prompt=${encodeURIComponent(prompt)}`);
    } else {
      router.push("/onboarding");
    }
  }

  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs uppercase tracking-wider text-gray-400 mb-5">
          AI-powered funnel builder
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-gray-900 leading-[1.1] tracking-tight mb-5">
          Build funnels that
          <br />
          <span className="text-gray-400">book calls</span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto mb-12 leading-relaxed">
          Describe your business in one sentence. AI generates a complete quiz-to-calendar funnel. Publish in minutes.
        </p>

        {/* Prompt box */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <div className="relative">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => { if (!userInput) setIsFocused(false); }}
                placeholder=""
                rows={3}
                className="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-transparent resize-none outline-none"
                style={{ fontSize: "16px" }}
              />
              {!userInput && !isFocused && (
                <div className="absolute top-0 left-0 px-4 py-3 text-sm text-gray-400 pointer-events-none">
                  {displayText}
                  <span className="animate-pulse">|</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-300 uppercase tracking-wider">Powered by AI</span>
              </div>
              <button
                onClick={handleSubmit}
                className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                Build it
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Trust line */}
        <p className="text-xs text-gray-400 mt-6">
          No credit card required. Free plan includes 3 funnels.
        </p>
      </div>
    </section>
  );
}
