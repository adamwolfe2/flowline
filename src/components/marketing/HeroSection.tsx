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
          <h1 className="text-3xl sm:text-[44px] md:text-[56px] lg:text-[68px] font-semibold leading-none text-white"
            style={{ fontFamily: "var(--font-lora)", textShadow: "0 2px 24px rgba(0,0,0,0.12)" }}>
            Your VSL funnel.
            <br />
            <span className="text-white/70">Built in 60 seconds.</span>
          </h1>
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mt-5 mb-10 leading-relaxed"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.08)" }}>
          Describe what you need and let AI handle the rest.
          <br className="hidden sm:block" />
          {" "}Build{" "}
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white font-semibold px-2.5 py-0.5 rounded-lg text-sm sm:text-base">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Quiz Funnels
          </span>
          {", "}
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white font-semibold px-2.5 py-0.5 rounded-lg text-sm sm:text-base">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Lead Scoring
          </span>
          {" and "}
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white font-semibold px-2.5 py-0.5 rounded-lg text-sm sm:text-base">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Calendar Routing
          </span>
          {" for your business."}
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
            <div className="flex items-center justify-between px-5 pb-4">
              {/* Integration icons */}
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5" title="Integrates with Cal.com, Zapier, HubSpot">
                  {/* Cal.com */}
                  <div className="w-7 h-7 rounded-full bg-[#111827] border-2 border-white flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  {/* Zapier */}
                  <div className="w-7 h-7 rounded-full bg-[#FF4A00] border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.2 13.2h-3.4l2.4 2.4-1.6 1.6-2.4-2.4v3.4h-2.4v-3.4l-2.4 2.4-1.6-1.6 2.4-2.4H4.8v-2.4h3.4L5.8 8.4l1.6-1.6 2.4 2.4V5.8h2.4v3.4l2.4-2.4 1.6 1.6-2.4 2.4h3.4v2.4z"/></svg>
                  </div>
                  {/* HubSpot */}
                  <div className="w-7 h-7 rounded-full bg-[#FF7A59] border-2 border-white flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">HS</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#9CA3AF] hidden sm:inline ml-1">+6 more</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Template icon */}
                <button type="button" className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9FAFB] transition-colors" title="Templates">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                </button>
                {/* Style icon */}
                <button type="button" className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9FAFB] transition-colors" title="Style">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>
                </button>
                {/* Build button */}
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 text-sm font-semibold pl-5 pr-4 py-2.5 rounded-xl transition-all hover:brightness-95 shadow-sm"
                  style={{ backgroundColor: "#2D6A4F", color: "#ffffff" }}
                >
                  Build it
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
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
