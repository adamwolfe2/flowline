"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
// URL generation redirects to /build?url=... for the full animated experience
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Globe, ArrowRight, ChevronRight, Sparkles, LayoutTemplate, Palette } from "lucide-react";

const QUICK_TEMPLATES = [
  { label: "Coaching Qualifier", prompt: "I sell business coaching to 6-figure entrepreneurs" },
  { label: "SaaS Demo Booker", prompt: "I run a B2B SaaS product for team collaboration" },
  { label: "Agency Lead Gen", prompt: "I run a digital marketing agency for ecommerce brands" },
  { label: "Real Estate", prompt: "I help first-time home buyers find properties" },
  { label: "Fitness Program", prompt: "I sell online fitness coaching for busy professionals" },
];

const COLOR_PRESETS = [
  { label: "Sky", color: "#0A9AFF" },
  { label: "Ocean", color: "#2563EB" },
  { label: "Violet", color: "#7C3AED" },
  { label: "Coral", color: "#DC2626" },
  { label: "Amber", color: "#D97706" },
  { label: "Ink", color: "#0A0A0A" },
];

export function HeroSection() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showStyles, setShowStyles] = useState(false);
  const urlLoading = false; // Loading happens on /build page
  const templateRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLDivElement>(null);

  const isUrl =
    /^https?:\/\//i.test(prompt.trim()) ||
    /\.[a-z]{2,}(\/|$)/i.test(prompt.trim());

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (templateRef.current && !templateRef.current.contains(e.target as Node)) setShowTemplates(false);
      if (styleRef.current && !styleRef.current.contains(e.target as Node)) setShowStyles(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleUrlGenerate() {
    let url = prompt.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    // Redirect to the build page which has the full animated build experience
    router.push(`/build?url=${encodeURIComponent(url)}`);
  }

  function handleSubmit() {
    if (isUrl) {
      handleUrlGenerate();
      return;
    }
    if (prompt.length > 5) {
      router.push(`/build?prompt=${encodeURIComponent(prompt)}`);
    } else {
      router.push("/build");
    }
  }

  return (
    <section className="sky-hero relative overflow-hidden">
      {/* Drifting clouds */}
      <div className="cloud w-[420px] h-[130px] top-[12%] -left-[80px] opacity-70" style={{ animationDuration: "22s" }} />
      <div className="cloud w-[320px] h-[100px] top-[8%] right-[6%] opacity-60" style={{ animationDuration: "28s", animationDelay: "-8s" }} />
      <div className="cloud w-[520px] h-[150px] top-[38%] right-[-120px] opacity-50" style={{ animationDuration: "26s", animationDelay: "-14s" }} />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-32 sm:pt-40 md:pt-44 pb-8 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link
            href="/build"
            className="group inline-flex items-center gap-1.5 rounded-full border border-[#0A0A0A]/15 bg-white/40 backdrop-blur-sm pl-4 pr-3 py-1.5 text-sm sm:text-[15px] font-medium text-[#0A0A0A]/80 hover:bg-white/70 transition-colors mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0A9AFF]" />
            Funnels that build themselves
            <ChevronRight className="w-4 h-4 text-[#0A0A0A]/50 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-[40px] sm:text-[64px] md:text-[76px] lg:text-[84px] font-bold leading-[1.02] tracking-[-0.03em] text-[#0A0A0A] max-w-5xl"
          style={{ fontFamily: "var(--font-instrument-sans)" }}
        >
          Your VSL funnel,
          <br />
          built in 60 seconds.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-lg sm:text-xl md:text-[22px] leading-relaxed text-[#0A0A0A]/65 max-w-2xl mt-6 mb-10"
        >
          Describe your business once. AI writes the quiz, scores every lead,
          and routes the best ones straight to your calendar.
        </motion.p>

        {/* Prompt box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white rounded-[28px] shadow-[0_24px_80px_-16px_rgba(6,60,110,0.35)] ring-1 ring-black/[0.05] text-left">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder="Describe your business or paste your website URL..."
              rows={3}
              className="w-full px-6 sm:px-7 py-5 sm:py-6 text-base text-[#0A0A0A] placeholder-[#9CA3AF] bg-transparent resize-none outline-none border-none focus:ring-0 focus:outline-none"
              style={{ fontSize: "16px" }}
              aria-label="Describe your business or paste a website URL"
              disabled={urlLoading}
            />
            {/* URL detection indicator */}
            {isUrl && !urlLoading && (
              <div className="flex items-center gap-1.5 px-7 pb-1">
                <Globe className="w-3.5 h-3.5 text-[#0A9AFF]" />
                <span className="text-xs text-[#0A9AFF] font-medium">
                  Website detected — we will scrape it and auto-generate your funnel
                </span>
              </div>
            )}
            <div className="flex items-center justify-between px-4 sm:px-5 pb-4">
              {/* Integration logos */}
              <div className="flex items-center">
                <div className="flex -space-x-1.5" title="Integrates with Calendly, Slack, HubSpot">
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center overflow-hidden">
                    <Image src="/integrations/calendly.svg" alt="Calendly" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                  </div>
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center overflow-hidden">
                    <Image src="/integrations/slack.svg" alt="Slack" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                  </div>
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center overflow-hidden">
                    <Image src="/integrations/hubspot-svgrepo-com.svg" alt="HubSpot" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                  </div>
                </div>
                <span className="text-[11px] text-[#9CA3AF] hidden sm:inline ml-2">+9 more</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Template dropdown */}
                <div ref={templateRef} className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowTemplates(!showTemplates); setShowStyles(false); }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${showTemplates ? "bg-[#0A9AFF]/10 text-[#0A9AFF]" : "text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F3F4F6]"}`}
                    title="Templates"
                    aria-label="Quick start templates"
                  >
                    <LayoutTemplate className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {showTemplates && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full right-0 mb-2 w-56 sm:w-64 bg-white rounded-2xl shadow-xl ring-1 ring-black/[0.06] overflow-hidden z-50"
                      >
                        <div className="px-4 py-2.5 border-b border-black/[0.05]">
                          <p className="text-xs font-semibold text-[#0A0A0A]">Quick start templates</p>
                          <p className="text-[10px] text-[#9CA3AF]">Click to prefill the prompt</p>
                        </div>
                        <div className="py-1">
                          {QUICK_TEMPLATES.map((t) => (
                            <button
                              key={t.label}
                              type="button"
                              onClick={() => { setPrompt(t.prompt); setShowTemplates(false); }}
                              className="w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#F6FAFF] transition-colors"
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Style dropdown */}
                <div ref={styleRef} className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowStyles(!showStyles); setShowTemplates(false); }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${showStyles ? "bg-[#0A9AFF]/10 text-[#0A9AFF]" : "text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F3F4F6]"}`}
                    title="Brand color"
                    aria-label="Brand color picker"
                  >
                    <Palette className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {showStyles && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-xl ring-1 ring-black/[0.06] overflow-hidden z-50"
                      >
                        <div className="px-4 py-2.5 border-b border-black/[0.05]">
                          <p className="text-xs font-semibold text-[#0A0A0A]">Brand color</p>
                        </div>
                        <div className="p-2 grid grid-cols-3 gap-1.5">
                          {COLOR_PRESETS.map((c) => (
                            <button
                              key={c.label}
                              type="button"
                              onClick={() => setShowStyles(false)}
                              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#F6FAFF] transition-colors"
                            >
                              <div className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: c.color }} />
                              <span className="text-[9px] text-[#6B7280]">{c.label}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Build button */}
                <button
                  onClick={handleSubmit}
                  disabled={urlLoading}
                  className="group flex items-center gap-2 text-[15px] font-semibold pl-5 pr-4 py-2.5 rounded-full bg-[#0A0A0A] text-white transition-all hover:bg-[#232323] hover:shadow-lg hover:shadow-black/15 disabled:opacity-60"
                >
                  {urlLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : isUrl ? (
                    <>
                      <Globe className="w-4 h-4" />
                      Generate from website
                    </>
                  ) : (
                    <>
                      Build it
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="text-sm text-[#0A0A0A]/50 mt-5 text-center">
            Free to start. No account required to build.
          </p>
        </motion.div>

        {/* Floating product frame */}
        <motion.div
          initial={{ opacity: 0, y: 56 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl mt-16 sm:mt-20"
        >
          <div className="bg-white/70 backdrop-blur-xl rounded-t-[24px] sm:rounded-t-[32px] ring-1 ring-white/60 shadow-[0_-8px_60px_-12px_rgba(6,60,110,0.25)] p-2 sm:p-3 pb-0">
            <div className="bg-white rounded-t-[18px] sm:rounded-t-[24px] ring-1 ring-black/[0.06] overflow-hidden">
              {/* Browser chrome */}
              <div className="h-11 flex items-center px-4 gap-2 border-b border-black/[0.05]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-[#F3F4F6] rounded-full px-4 py-1 text-[11px] text-[#9CA3AF]">
                    app.getmyvsl.com
                  </div>
                </div>
              </div>
              {/* App mock */}
              <div className="grid grid-cols-[200px_1fr] max-sm:grid-cols-1 min-h-[300px] sm:min-h-[380px] text-left">
                {/* Sidebar */}
                <div className="hidden sm:flex flex-col gap-1 border-r border-black/[0.05] p-4 bg-[#FAFAF8]">
                  <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-2 mb-1">Funnels</div>
                  {["Coaching Qualifier", "SaaS Demo Booker", "Agency Lead Gen"].map((f, i) => (
                    <div key={f} className={`text-[13px] px-3 py-2 rounded-xl ${i === 0 ? "bg-white shadow-sm ring-1 ring-black/[0.04] font-medium text-[#0A0A0A]" : "text-[#6B7280]"}`}>
                      {f}
                    </div>
                  ))}
                  <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-2 mt-4 mb-1">This week</div>
                  <div className="px-3 py-2 rounded-xl text-[13px] text-[#6B7280]">142 leads captured</div>
                  <div className="px-3 py-2 rounded-xl text-[13px] text-[#6B7280]">38 calls booked</div>
                </div>
                {/* Main panel */}
                <div className="p-5 sm:p-7">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-base sm:text-lg font-semibold text-[#0A0A0A] tracking-tight">Coaching Qualifier</div>
                      <div className="text-xs text-[#9CA3AF]">Live · getmyvsl.com/f/coaching</div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#E8F6EE] text-[#1C8A50] text-xs font-semibold rounded-full px-3 py-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1C8A50]" />
                      Converting 28%
                    </div>
                  </div>
                  {/* Lead rows */}
                  <div className="space-y-2">
                    {[
                      { name: "Dana R.", score: 92, tier: "Hot", cls: "bg-[#E8F6EE] text-[#1C8A50]", dest: "Booked · Discovery call" },
                      { name: "Marcus T.", score: 74, tier: "Warm", cls: "bg-[#FFF4E0] text-[#B26A00]", dest: "Booked · Intro call" },
                      { name: "Priya S.", score: 41, tier: "Nurture", cls: "bg-[#F3F4F6] text-[#6B7280]", dest: "Email sequence" },
                    ].map((lead) => (
                      <div key={lead.name} className="flex items-center justify-between bg-white rounded-2xl ring-1 ring-black/[0.05] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E5F3FF] text-[#0A9AFF] text-xs font-bold flex items-center justify-center">
                            {lead.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="text-[13px] font-medium text-[#0A0A0A]">{lead.name}</div>
                            <div className="text-[11px] text-[#9CA3AF]">{lead.dest}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[13px] font-semibold text-[#0A0A0A]">{lead.score}</span>
                          <span className={`text-[10px] font-semibold rounded-full px-2.5 py-1 ${lead.cls}`}>{lead.tier}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
