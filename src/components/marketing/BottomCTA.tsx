"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const PROMPTS = [
  "I sell business coaching to 6-figure entrepreneurs",
  "I run a digital marketing agency for ecommerce brands",
  "I help first-time home buyers find properties",
  "I sell online fitness coaching for busy professionals",
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
    <section className="bg-white py-6 sm:py-10 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="sky-cta relative overflow-hidden rounded-[32px] sm:rounded-[40px] max-w-6xl mx-auto py-20 sm:py-28 md:py-32 px-6 sm:px-10"
      >
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2
            className="text-[34px] sm:text-[48px] md:text-[56px] font-bold text-[#0A0A0A] tracking-[-0.03em] leading-[1.08] mb-4"
            style={{ fontFamily: "var(--font-instrument-sans)" }}
          >
            Built for you and
            <br />
            your best leads.
          </h2>
          <p className="text-lg sm:text-xl text-[#0A0A0A]/60 mb-10 max-w-xl mx-auto">
            <span className="hidden sm:inline">Try it with your own business: </span>
            <span className="italic">&ldquo;{displayText}</span>
            <span className="animate-pulse not-italic">|</span>
            <span className="italic">&rdquo;</span>
          </p>

          <button
            onClick={() => router.push("/sign-up")}
            className="group inline-flex items-center gap-2.5 bg-[#0A0A0A] text-white text-base sm:text-lg font-semibold pl-7 pr-6 py-3.5 sm:py-4 rounded-full hover:bg-[#232323] transition-all hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5"
          >
            Start building free
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <p className="text-sm text-[#0A0A0A]/45 mt-5">
            No credit card required. Live in minutes.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
