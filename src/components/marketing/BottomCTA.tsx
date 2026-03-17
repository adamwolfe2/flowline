"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const PROMPTS = [
  "build a quiz funnel that qualifies coaching leads",
  "create a lead scorer for my digital agency",
  "make a booking page for real estate showings",
];

export function BottomCTA() {
  const router = useRouter();
  const [displayText, setDisplayText] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const typewriter = useCallback(() => {
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
  }, [displayText, isTyping, promptIndex]);

  useEffect(() => {
    return typewriter();
  }, [typewriter]);

  return (
    <section className="bg-[#212124] rounded-t-[40px] py-20 md:py-28 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-[36px] sm:text-[48px] md:text-[56px] font-semibold text-white leading-tight mb-10"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            What will you build?
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-2xl mx-auto"
        >
          {/* Dark prompt box */}
          <div className="bg-[#252528] border border-white/[0.08] rounded-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="h-9 flex items-center px-4 gap-1.5 border-b border-white/[0.06]">
              <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
            </div>

            {/* Prompt area */}
            <div className="px-6 py-5 min-h-[100px] text-left">
              <p className="text-base text-white/50">
                {displayText}
                <span className="animate-pulse text-white/30">|</span>
              </p>
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-5 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[10px] text-white/30">
                  Q
                </div>
                <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[10px] text-white/30">
                  B
                </div>
                <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[10px] text-white/30">
                  L
                </div>
              </div>
              <button
                onClick={() => router.push("/sign-up")}
                className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-lg transition-all hover:brightness-95"
                style={{ backgroundColor: "#2D6A4F", color: "#ffffff" }}
              >
                Get started
                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
