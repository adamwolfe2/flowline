"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

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
    <section className="bg-[#F9FAFB] py-8 px-4">
      <div className="bg-white/60 backdrop-blur-xl border border-[#E5E7EB] rounded-2xl sm:rounded-[40px] max-w-6xl mx-auto py-10 sm:py-20 md:py-28 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-2xl sm:text-[36px] md:text-[48px] lg:text-[56px] font-semibold text-[#111827] leading-tight mb-10"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            Ready to build your first funnel?
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
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
            {/* Browser chrome */}
            <div className="h-9 flex items-center px-4 gap-1.5 border-b border-[#E5E7EB]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" />
            </div>

            {/* Prompt area */}
            <div className="px-6 py-5 min-h-[100px] text-left">
              <p className="text-base text-[#9CA3AF]">
                {displayText}
                <span className="animate-pulse text-[#D1D5DB]">|</span>
              </p>
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-5 pb-4">
              <div className="flex -space-x-1.5" title="Integrates with Calendly, Slack, HubSpot">
                <div className="w-6 h-6 rounded-full border-2 border-white bg-white flex items-center justify-center overflow-hidden">
                  <Image src="/integrations/calendly.svg" alt="Calendly" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-white bg-white flex items-center justify-center overflow-hidden">
                  <Image src="/integrations/slack.svg" alt="Slack" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-white bg-white flex items-center justify-center overflow-hidden">
                  <Image src="/integrations/hubspot-svgrepo-com.svg" alt="HubSpot" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                </div>
              </div>
              <button
                onClick={() => router.push("/sign-up")}
                className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-lg transition-all hover:brightness-95"
                style={{ backgroundColor: "#2D6A4F", color: "#ffffff" }}
              >
                Get Started Free
                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </section>
  );
}
