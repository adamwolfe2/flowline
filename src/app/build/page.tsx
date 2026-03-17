"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { deriveLightColor, deriveDarkColor } from "@/lib/colors";
import { toast } from "sonner";

const BUILD_STEPS = [
  "Analyzing your business...",
  "Writing your headline...",
  "Crafting qualifying questions...",
  "Setting up lead scoring...",
  "Configuring calendar routing...",
  "Rendering your funnel...",
];

function pickColor(desc: string): string {
  const colors = ["#2D6A4F", "#2563EB", "#7C3AED", "#059669", "#DC2626", "#D97706", "#0891B2", "#4F46E5"];
  let hash = 0;
  for (const char of desc) hash = char.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function BuildContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPrompt = searchParams.get("prompt") || "";

  const [prompt, setPrompt] = useState(initialPrompt);
  const [status, setStatus] = useState<"input" | "building" | "done">(initialPrompt ? "input" : "input");
  const [buildStep, setBuildStep] = useState(0);
  const [generatedData, setGeneratedData] = useState<Record<string, unknown> | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#2D6A4F");

  // Auto-start if prompt came from homepage
  useEffect(() => {
    if (initialPrompt && initialPrompt.length > 10) {
      handleBuild(initialPrompt);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleBuild(desc?: string) {
    const text = desc || prompt;
    if (text.length < 10) return;

    setStatus("building");
    setBuildStep(0);

    // Animate through steps
    const timers = BUILD_STEPS.map((_, i) =>
      setTimeout(() => setBuildStep(i), i * 800)
    );

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      const color = pickColor(text);
      setPrimaryColor(color);
      setGeneratedData(data);
      setStatus("done");

      // Save to localStorage
      localStorage.setItem("myvsl_pending_funnel", JSON.stringify({
        config: {
          brand: {
            name: data.brandName || text.split(" ").slice(0, 3).join(" "),
            logoUrl: "",
            primaryColor: color,
            primaryColorLight: deriveLightColor(color),
            primaryColorDark: deriveDarkColor(color),
            fontHeading: "Inter",
            fontBody: "Inter",
          },
          quiz: {
            headline: data.headline,
            subheadline: data.subheadline,
            questions: data.questions,
            thresholds: data.thresholds || { high: 7, mid: 4 },
            calendars: { high: "", mid: "", low: "" },
          },
          webhook: { url: "" },
          meta: { title: `Apply | ${data.brandName || "My Business"}`, description: data.metaDescription || "" },
        },
        slug: (data.brandName || "my-funnel").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30),
      }));

      timers.forEach(clearTimeout);
    } catch {
      toast.error("Generation failed. Please try again.");
      setStatus("input");
      timers.forEach(clearTimeout);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="h-14 border-b border-[#E5E7EB] flex items-center justify-between px-4 md:px-6 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="MyVSL" width={20} height={20} />
          <span className="font-semibold text-[#111827] text-sm">MyVSL</span>
        </Link>
        <div className="flex items-center gap-3">
          {status === "done" && (
            <Link href="/sign-up" className="bg-[#2D6A4F] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#245840] transition-colors flex items-center gap-1.5">
              Save & Publish <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link href="/sign-in" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
            Sign in
          </Link>
        </div>
      </div>

      {/* Main content — two panels */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT — Input + AI progress */}
        <div className="w-full lg:w-[400px] xl:w-[440px] border-r border-[#E5E7EB] flex flex-col flex-shrink-0 overflow-y-auto">
          {/* Prompt input */}
          <div className="p-5 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
              <span className="text-xs text-[#6B7280] font-medium">AI Builder</span>
            </div>
            {status === "input" ? (
              <>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleBuild(); } }}
                  placeholder="Describe your business and ideal client..."
                  rows={3}
                  className="w-full text-sm text-[#111827] placeholder-[#9CA3AF] resize-none outline-none border border-[#E5E7EB] rounded-xl p-3 focus:border-[#2D6A4F] transition-colors"
                  style={{ fontSize: "16px" }}
                />
                <button onClick={() => handleBuild()} disabled={prompt.length < 10}
                  className="w-full mt-3 py-2.5 bg-[#2D6A4F] hover:bg-[#245840] disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> Generate My Funnel
                </button>
              </>
            ) : (
              <div className="bg-[#F9FAFB] rounded-xl px-4 py-3 border border-[#E5E7EB]">
                <p className="text-sm text-[#111827]">{prompt}</p>
              </div>
            )}
          </div>

          {/* Build progress */}
          {(status === "building" || status === "done") && (
            <div className="p-5 space-y-3">
              <p className="text-xs text-[#6B7280] font-medium mb-2">
                {status === "building" ? "Building your funnel..." : "Funnel ready"}
              </p>
              {BUILD_STEPS.map((step, i) => (
                <motion.div key={step} initial={{ opacity: 0, x: -8 }} animate={{ opacity: i <= buildStep ? 1 : 0.3, x: 0 }}
                  transition={{ delay: i * 0.05 }} className="flex items-center gap-3">
                  {i < buildStep || status === "done" ? (
                    <div className="w-5 h-5 rounded-full bg-[#2D6A4F] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : i === buildStep && status === "building" ? (
                    <Loader2 className="w-5 h-5 text-[#2D6A4F] animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#E5E7EB] flex-shrink-0" />
                  )}
                  <span className={`text-sm ${i <= buildStep || status === "done" ? "text-[#111827]" : "text-[#9CA3AF]"}`}>{step}</span>
                </motion.div>
              ))}

              {/* Generated questions list */}
              {status === "done" && generatedData && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 pt-4 border-t border-[#E5E7EB]">
                  <p className="text-xs text-[#9CA3AF] mb-2">Generated questions:</p>
                  {((generatedData.questions as Array<{text: string}>) || []).map((q, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#6B7280] py-1">
                      <span className="text-[#9CA3AF] flex-shrink-0">{i + 1}.</span>
                      <span>{q.text}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* Bottom CTA */}
          {status === "done" && (
            <div className="mt-auto p-5 border-t border-[#E5E7EB]">
              <Link href="/sign-up"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#2D6A4F] text-white text-sm font-semibold rounded-lg hover:bg-[#245840] transition-colors">
                Save & Publish My Funnel <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-center text-[10px] text-[#9CA3AF] mt-2">Free plan. No credit card required.</p>
            </div>
          )}
        </div>

        {/* RIGHT — Live preview */}
        <div className="flex-1 bg-[#F9FAFB] flex items-center justify-center p-6 md:p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            {status === "input" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center max-w-sm">
                <div className="w-16 h-16 bg-[#2D6A4F]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#2D6A4F]" />
                </div>
                <p className="text-lg font-semibold text-[#111827] mb-2" style={{ fontFamily: "var(--font-lora)" }}>Your funnel will appear here</p>
                <p className="text-sm text-[#9CA3AF]">Describe your business on the left and click Generate</p>
              </motion.div>
            )}

            {status === "building" && (
              <motion.div key="building" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center">
                <div className="w-12 h-12 border-2 border-[#E5E7EB] border-t-[#2D6A4F] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-[#6B7280]">{BUILD_STEPS[buildStep]}</p>
              </motion.div>
            )}

            {status === "done" && generatedData && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md">
                {/* Browser chrome */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
                  <div className="h-9 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center px-3 gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" />
                    <div className="flex-1 mx-4">
                      <div className="bg-white border border-[#E5E7EB] rounded px-2 py-0.5 text-[9px] text-[#9CA3AF] text-center max-w-[180px] mx-auto">
                        getmyvsl.com/f/your-funnel
                      </div>
                    </div>
                  </div>

                  {/* Funnel preview */}
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: primaryColor }}>
                      {((generatedData.brandName as string) || "M")[0].toUpperCase()}
                    </div>
                    <div className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3"
                      style={{ backgroundColor: deriveLightColor(primaryColor), color: primaryColor }}>
                      Free Assessment
                    </div>
                    <h3 className="text-xl font-bold text-[#111827] leading-tight mb-2">
                      {(generatedData.headline as string) || "Your Headline"}
                    </h3>
                    <p className="text-sm text-[#6B7280] mb-6">
                      {(generatedData.subheadline as string) || "Your subheadline"}
                    </p>
                    <button className="w-full py-3 rounded-xl text-white font-semibold text-sm"
                      style={{ backgroundColor: primaryColor }}>
                      Take the Quiz
                    </button>
                  </div>

                  {/* Blurred question gate */}
                  <div className="relative border-t border-[#E5E7EB] p-6">
                    <div className="blur-sm opacity-40">
                      <p className="text-xs text-[#9CA3AF] mb-1">Question 1 of 3</p>
                      <p className="text-sm font-medium text-[#111827] mb-3">
                        {((generatedData.questions as Array<{text: string}>)?.[0]?.text) || "First question"}
                      </p>
                      {((generatedData.questions as Array<{options: Array<{label: string}>}>)?.[0]?.options || []).slice(0, 3).map((opt, i) => (
                        <div key={i} className="text-xs px-3 py-2 mb-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280]">{opt.label}</div>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                      <div className="text-center">
                        <p className="text-sm font-medium text-[#111827] mb-2">Sign up to customize & publish</p>
                        <Link href="/sign-up" className="text-xs text-[#2D6A4F] font-medium hover:underline">
                          Create free account
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function BuildPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#2D6A4F]" /></div>}>
      <BuildContent />
    </Suspense>
  );
}
