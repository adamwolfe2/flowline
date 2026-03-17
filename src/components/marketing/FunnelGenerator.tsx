"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { deriveLightColor, deriveDarkColor } from "@/lib/colors";
import Link from "next/link";

const SUGGESTIONS = [
  "Fitness coaching for busy professionals",
  "Marketing agency for local businesses",
  "SaaS tool for restaurant owners",
  "Real estate investor education",
  "Business consulting for founders",
];

const STREAMING_STEPS = [
  "Analyzing your business...",
  "Writing your headline...",
  "Crafting qualifying questions...",
  "Setting up lead scoring...",
  "Rendering your preview...",
];

// Deterministic color from description
function pickColor(desc: string): string {
  const colors = ["#2D6A4F", "#2563EB", "#7C3AED", "#059669", "#DC2626", "#D97706", "#0891B2", "#4F46E5"];
  let hash = 0;
  for (const char of desc) hash = char.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function FunnelGenerator() {
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [streamingStep, setStreamingStep] = useState(0);
  const [generatedData, setGeneratedData] = useState<Record<string, unknown> | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#2D6A4F");

  async function handleGenerate() {
    if (description.length < 15) return;
    setStatus("generating");
    setStreamingStep(0);

    // Animate streaming steps
    const timers = STREAMING_STEPS.map((_, i) =>
      setTimeout(() => setStreamingStep(i), i * 800)
    );

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: description }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      const color = pickColor(description);
      setPrimaryColor(color);
      setGeneratedData(data);
      setStatus("done");

      // Save to localStorage for sign-up resume
      localStorage.setItem("myvsl_pending_funnel", JSON.stringify({
        config: {
          brand: {
            name: data.brandName || description.split(" ").slice(0, 3).join(" "),
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
          meta: {
            title: `Apply | ${data.brandName || "My Business"}`,
            description: data.metaDescription || "",
          },
        },
        slug: (data.brandName || "my-funnel").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30),
        description,
        generatedAt: Date.now(),
      }));

      timers.forEach(clearTimeout);
    } catch {
      setStatus("error");
      timers.forEach(clearTimeout);
    }
  }

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[480px]">

          {/* LEFT — Input */}
          <div className="p-6 md:p-8 flex flex-col">
            <label className="text-sm font-medium text-[#111827] mb-2">
              Describe your business and ideal client
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. I help e-commerce brands scale their revenue with paid ads. My ideal client does $10k-$100k/month and wants to double revenue in 90 days."
              className="flex-1 min-h-[120px] text-base text-[#111827] placeholder-[#9CA3AF] resize-none outline-none border border-[#E5E7EB] rounded-xl p-4 focus:border-[#2D6A4F] transition-colors"
              style={{ fontSize: "16px" }}
              disabled={status === "generating"}
            />

            {/* Suggestion pills */}
            {status === "idle" && (
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs text-[#9CA3AF] self-center">Try:</span>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setDescription(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-[#E5E7EB] text-[#6B7280] hover:border-[#2D6A4F] hover:text-[#2D6A4F] hover:bg-[#F0F7F4] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
              {(status === "idle" || status === "error") && (
                <button
                  onClick={handleGenerate}
                  disabled={description.length < 15}
                  className="w-full py-3.5 bg-[#2D6A4F] hover:bg-[#245840] disabled:opacity-40 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate My Funnel
                </button>
              )}
              {status === "generating" && (
                <button disabled className="w-full py-3.5 bg-[#2D6A4F]/70 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </button>
              )}
              {status === "done" && (
                <div className="space-y-3">
                  <Link
                    href="/sign-up"
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#2D6A4F] hover:bg-[#245840] text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    Save & Publish My Funnel
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-center text-[10px] text-[#9CA3AF]">
                    Free forever plan. No credit card required.
                  </p>
                </div>
              )}
              {status === "error" && (
                <p className="text-xs text-red-500 text-center mt-2">Something went wrong. Try again.</p>
              )}
            </div>
          </div>

          {/* RIGHT — Preview */}
          <div className="bg-[#F9FAFB] border-l border-[#E5E7EB] p-6 md:p-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {status === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-[#2D6A4F]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-[#2D6A4F]" />
                  </div>
                  <p className="text-sm text-[#9CA3AF]">Your funnel preview will appear here</p>
                </motion.div>
              )}

              {status === "generating" && (
                <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <div className="space-y-3">
                    {STREAMING_STEPS.map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: i <= streamingStep ? 1 : 0.3, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        {i < streamingStep ? (
                          <div className="w-5 h-5 rounded-full bg-[#2D6A4F] flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : i === streamingStep ? (
                          <div className="w-5 h-5 rounded-full border-2 border-[#2D6A4F] border-t-transparent animate-spin flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-[#E5E7EB] flex-shrink-0" />
                        )}
                        <span className={`text-sm ${i <= streamingStep ? "text-[#111827]" : "text-[#9CA3AF]"}`}>
                          {step}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {status === "done" && generatedData && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="w-full"
                >
                  {/* Mini funnel preview */}
                  <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                    <div className="p-6 text-center">
                      <div className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {((generatedData.brandName as string) || "M")[0].toUpperCase()}
                      </div>
                      <div className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2"
                        style={{ backgroundColor: deriveLightColor(primaryColor), color: primaryColor }}
                      >
                        Free Assessment
                      </div>
                      <h3 className="text-base font-bold text-[#111827] leading-tight mb-1">
                        {(generatedData.headline as string) || "Your Headline"}
                      </h3>
                      <p className="text-xs text-[#6B7280]">
                        {(generatedData.subheadline as string) || "Your subheadline"}
                      </p>
                      <button className="w-full mt-4 py-2.5 rounded-lg text-white text-xs font-semibold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Take the Quiz
                      </button>
                    </div>

                    {/* Blurred question preview */}
                    <div className="relative border-t border-[#E5E7EB] p-4">
                      <div className="blur-sm opacity-50">
                        <p className="text-xs text-[#9CA3AF] mb-1">Question 1 of 3</p>
                        <p className="text-sm font-medium text-[#111827] mb-2">
                          {((generatedData.questions as Array<{text: string}>)?.[0]?.text) || "First question"}
                        </p>
                        <div className="space-y-1.5">
                          {((generatedData.questions as Array<{options: Array<{label: string}>}>)?.[0]?.options || []).slice(0, 3).map((opt, i) => (
                            <div key={i} className="text-xs px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#6B7280]">
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                        <p className="text-xs font-medium text-[#6B7280]">Sign up to see full funnel</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
