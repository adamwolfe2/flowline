"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
// URL generation redirects to /build?url=... for the full animated experience
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Loader2, Globe } from "lucide-react";
import { toast } from "sonner";

const QUICK_TEMPLATES = [
  { label: "Coaching Qualifier", prompt: "I sell business coaching to 6-figure entrepreneurs" },
  { label: "SaaS Demo Booker", prompt: "I run a B2B SaaS product for team collaboration" },
  { label: "Agency Lead Gen", prompt: "I run a digital marketing agency for ecommerce brands" },
  { label: "Real Estate", prompt: "I help first-time home buyers find properties" },
  { label: "Fitness Program", prompt: "I sell online fitness coaching for busy professionals" },
];

const COLOR_PRESETS = [
  { label: "Forest", color: "#2D6A4F" },
  { label: "Ocean", color: "#2563EB" },
  { label: "Violet", color: "#7C3AED" },
  { label: "Coral", color: "#DC2626" },
  { label: "Amber", color: "#D97706" },
  { label: "Slate", color: "#0F172A" },
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
    <section className="relative overflow-hidden pb-24">
      {/* Forest background */}
      <div className="absolute inset-0">
        <Image
          src="/hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
          quality={75}
        />
      </div>
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, transparent 0%, transparent 40%, rgba(255,255,255,0.3) 60%, rgba(255,255,255,0.7) 80%, #FFFFFF 100%)",
      }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 pt-20 sm:pt-28 md:pt-36 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-[28px] sm:text-[48px] md:text-[60px] lg:text-[72px] font-extrabold leading-[1.05] text-white"
            style={{ fontFamily: "var(--font-plus-jakarta)", textShadow: "0 2px 24px rgba(0,0,0,0.15)" }}>
            Your VSL funnel.
            <br />
            <span className="text-white/70">Built in 60 seconds.</span>
          </h1>
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-white/80 max-w-2xl mt-5 mb-10"
          style={{ fontFamily: "var(--font-plus-jakarta)", textShadow: "0 1px 10px rgba(0,0,0,0.08)" }}>
          <span className="block text-base sm:text-xl md:text-2xl leading-relaxed mb-2">Describe what you need and let AI handle the rest.</span>
          <span className="block text-base sm:text-lg md:text-xl leading-relaxed">Build{" "}
          <span className="group/pill inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white font-semibold px-2.5 sm:px-3 py-1 sm:py-1 rounded-lg text-sm cursor-default transition-all duration-200 hover:bg-white/30 hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10">
            <svg className="w-4 h-4 transition-transform duration-200 group-hover/pill:scale-125 group-hover/pill:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Quiz Funnels
          </span>
          {", "}
          <span className="group/pill inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white font-semibold px-2.5 sm:px-3 py-1 sm:py-1 rounded-lg text-sm cursor-default transition-all duration-200 hover:bg-white/30 hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10">
            <svg className="w-4 h-4 transition-transform duration-200 group-hover/pill:scale-125 group-hover/pill:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Lead Scoring
          </span>
          {" and "}
          <span className="group/pill inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white font-semibold px-2.5 sm:px-3 py-1 sm:py-1 rounded-lg text-sm cursor-default transition-all duration-200 hover:bg-white/30 hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10">
            <svg className="w-4 h-4 transition-transform duration-200 group-hover/pill:scale-125 group-hover/pill:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Calendar Routing
          </span>
          <span className="whitespace-nowrap">{" "}for your business.</span></span>
        </motion.p>

        {/* Clean prompt box — Zite style */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-white/20">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder="Describe your business or paste your website URL..."
              rows={3}
              className="w-full px-6 py-5 text-base text-[#111827] placeholder-[#9CA3AF] bg-transparent resize-none outline-none border-none focus:ring-0 focus:outline-none"
              style={{ fontSize: "16px" }}
              aria-label="Describe your business or paste a website URL"
              disabled={urlLoading}
            />
            {/* URL detection indicator */}
            {isUrl && !urlLoading && (
              <div className="flex items-center gap-1.5 px-6 pb-1">
                <Globe className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span className="text-xs text-[#2D6A4F] font-medium">
                  Website detected — we will scrape it and auto-generate your funnel
                </span>
              </div>
            )}
            {/* Loading animation happens on /build page */}
            <div className="flex items-center justify-between px-5 pb-4">
              {/* Integration logos */}
              <div className="flex items-center">
                <div className="flex -space-x-1.5" title="Integrates with Calendly, Slack, HubSpot">
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-white flex items-center justify-center overflow-hidden">
                    <img src="/integrations/calendly.svg" alt="Calendly" className="w-3.5 h-3.5 object-contain" />
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-white flex items-center justify-center overflow-hidden">
                    <img src="/integrations/slack.svg" alt="Slack" className="w-3.5 h-3.5 object-contain" />
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-white flex items-center justify-center overflow-hidden">
                    <img src="/integrations/hubspot-svgrepo-com.svg" alt="HubSpot" className="w-3.5 h-3.5 object-contain" />
                  </div>
                </div>
                <span className="text-[10px] text-[#9CA3AF] hidden sm:inline ml-1.5">+9 more</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Template dropdown */}
                <div ref={templateRef} className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowTemplates(!showTemplates); setShowStyles(false); }}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${showTemplates ? "border-[#2D6A4F] text-[#2D6A4F] bg-[#2D6A4F]/5" : "border-[#E5E7EB] text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9FAFB]"}`}
                    title="Templates"
                    aria-label="Quick start templates"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                  </button>
                  <AnimatePresence>
                    {showTemplates && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden z-50"
                      >
                        <div className="px-3 py-2 border-b border-[#F3F4F6]">
                          <p className="text-xs font-semibold text-[#111827]">Quick start templates</p>
                          <p className="text-[10px] text-[#9CA3AF]">Click to prefill the prompt</p>
                        </div>
                        <div className="py-1">
                          {QUICK_TEMPLATES.map((t) => (
                            <button
                              key={t.label}
                              type="button"
                              onClick={() => { setPrompt(t.prompt); setShowTemplates(false); }}
                              className="w-full text-left px-3 py-2 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
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
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${showStyles ? "border-[#2D6A4F] text-[#2D6A4F] bg-[#2D6A4F]/5" : "border-[#E5E7EB] text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9FAFB]"}`}
                    title="Brand color"
                    aria-label="Brand color picker"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>
                  </button>
                  <AnimatePresence>
                    {showStyles && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden z-50"
                      >
                        <div className="px-3 py-2 border-b border-[#F3F4F6]">
                          <p className="text-xs font-semibold text-[#111827]">Brand color</p>
                        </div>
                        <div className="p-2 grid grid-cols-3 gap-1.5">
                          {COLOR_PRESETS.map((c) => (
                            <button
                              key={c.label}
                              type="button"
                              onClick={() => setShowStyles(false)}
                              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors"
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
                  className="flex items-center gap-2 text-sm font-semibold pl-5 pr-4 py-2.5 rounded-xl transition-all hover:brightness-95 shadow-sm disabled:opacity-60"
                  style={{ backgroundColor: "#2D6A4F", color: "#ffffff" }}
                >
                  {urlLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : isUrl ? (
                    <>
                      <Globe className="w-3.5 h-3.5" />
                      Generate from website
                    </>
                  ) : (
                    <>
                      Build it
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-[#6B7280] mt-4 text-center">
            Free to start. No account required to build.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
