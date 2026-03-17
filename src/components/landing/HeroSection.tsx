"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const prompts = [
  "Build a quiz funnel for my SaaS consulting agency that qualifies leads by revenue and team size...",
  "Create a lead qualifier for my fitness coaching business that books discovery calls...",
  "Make a booking funnel for my real estate team that routes hot leads to senior agents...",
];

const pills = ["Quiz Funnels", "Booking Pages", "Lead Qualifiers"];

const integrations = [
  { name: "Cal.com", color: "#292929" },
  { name: "Calendly", color: "#006BFF" },
  { name: "Zapier", color: "#FF4A00" },
  { name: "Make", color: "#6D00CC" },
];

export function HeroSection() {
  const router = useRouter();
  const [displayText, setDisplayText] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [userHasFocused, setUserHasFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Typewriter effect
  useEffect(() => {
    if (userHasFocused) return;

    const currentPrompt = prompts[promptIdx];
    let charIdx = 0;
    let erasing = false;
    let pauseTimer: ReturnType<typeof setTimeout>;

    const typeInterval = setInterval(() => {
      if (!erasing) {
        if (charIdx <= currentPrompt.length) {
          setDisplayText(currentPrompt.slice(0, charIdx));
          charIdx++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          pauseTimer = setTimeout(() => {
            erasing = true;
            setIsTyping(true);
            const eraseInterval = setInterval(() => {
              charIdx--;
              if (charIdx >= 0) {
                setDisplayText(currentPrompt.slice(0, charIdx));
              } else {
                clearInterval(eraseInterval);
                setPromptIdx((prev) => (prev + 1) % prompts.length);
              }
            }, 15);
          }, 3000);
        }
      }
    }, 30);

    return () => {
      clearInterval(typeInterval);
      if (pauseTimer) clearTimeout(pauseTimer);
    };
  }, [promptIdx, userHasFocused]);

  const handleFocus = useCallback(() => {
    setUserHasFocused(true);
    setDisplayText("");
  }, []);

  const handleBuild = useCallback(() => {
    const text = userInput.trim();
    if (text) {
      router.push(`/onboarding?prompt=${encodeURIComponent(text)}`);
    } else {
      router.push("/onboarding");
    }
  }, [userInput, router]);

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/40 via-white to-white pointer-events-none" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(251,191,36,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
          The AI funnel builder
          <br />
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            that books calls
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-6 leading-relaxed">
          Describe your business. Get a live quiz funnel.
          <br className="hidden sm:block" /> Start booking calls in minutes.
        </p>

        {/* Pill badges */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <span className="text-sm text-gray-400 mr-1">Build</span>
          {pills.map((pill) => (
            <span
              key={pill}
              className="text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full"
            >
              {pill}
            </span>
          ))}
        </div>

        {/* Prompt textarea card */}
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/80 p-1">
            {/* Browser mockup behind - subtle */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gray-50/60 border border-gray-100 hidden lg:block">
              <div className="flex items-center gap-1.5 px-4 pt-3">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <div className="ml-3 h-5 w-48 rounded-md bg-gray-100" />
              </div>
            </div>

            <div className="p-4">
              <textarea
                ref={textareaRef}
                value={userHasFocused ? userInput : ""}
                onChange={(e) => setUserInput(e.target.value)}
                onFocus={handleFocus}
                placeholder={userHasFocused ? "Describe your business and ideal funnel..." : ""}
                rows={3}
                className="w-full resize-none text-base text-gray-900 placeholder:text-gray-400 bg-transparent outline-none leading-relaxed"
              />
              {!userHasFocused && (
                <div className="absolute top-5 left-5 right-5 pointer-events-none text-base text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {displayText}
                  <span className="inline-block w-0.5 h-5 bg-amber-500 ml-0.5 animate-pulse align-text-bottom" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 pb-4">
              {/* Integration dots */}
              <div className="flex items-center gap-2">
                {integrations.map((i) => (
                  <div
                    key={i.name}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                    style={{ backgroundColor: i.color }}
                    title={i.name}
                  >
                    {i.name[0]}
                  </div>
                ))}
                <span className="text-xs text-gray-400 ml-1">+ more</span>
              </div>

              <button
                onClick={handleBuild}
                className="flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md"
              >
                Build it
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
