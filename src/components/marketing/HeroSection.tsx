"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function HeroSection() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  function handleSubmit() {
    if (prompt.length > 5) {
      router.push(`/build?prompt=${encodeURIComponent(prompt)}`);
    } else {
      router.push("/build");
    }
  }

  return (
    <section className="relative overflow-hidden pb-24">
      {/* Forest background */}
      <div className="absolute inset-0" style={{
        backgroundImage: "url(/hero-bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }} />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, transparent 0%, transparent 40%, rgba(255,255,255,0.3) 60%, rgba(255,255,255,0.7) 80%, #FFFFFF 100%)",
      }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-28 md:pt-36 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-[44px] sm:text-[56px] md:text-[68px] font-semibold leading-none text-white"
            style={{ fontFamily: "var(--font-lora)", textShadow: "0 2px 24px rgba(0,0,0,0.12)" }}>
            Your VSL funnel.
            <br />
            <span className="text-white/70">Built in 60 seconds.</span>
          </h1>
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-base sm:text-lg md:text-xl text-white/85 max-w-xl mt-5 mb-10"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.08)" }}>
          Describe your product in one sentence. AI generates the questions, scoring, and booking flow.
        </motion.p>

        {/* Clean prompt box — Zite style */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder="I sell business coaching to 6-figure entrepreneurs..."
              rows={3}
              className="w-full px-6 py-5 text-base text-[#111827] placeholder-[#9CA3AF] bg-transparent resize-none outline-none border-none focus:ring-0 focus:outline-none"
              style={{ fontSize: "16px" }}
            />
            <div className="flex items-center justify-end px-5 pb-4">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-lg transition-all hover:brightness-95"
                style={{ backgroundColor: "#2D6A4F", color: "#ffffff" }}
              >
                Build it
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-xs text-white/60 mt-4 text-center" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            Free to start. No account required to build.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
