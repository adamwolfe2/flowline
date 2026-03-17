"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "@/hooks/useInView";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  const router = useRouter();
  const { ref, inView } = useInView(0.15);
  const [prompt, setPrompt] = useState("");

  const handleSubmit = useCallback(() => {
    const text = prompt.trim();
    if (text) {
      router.push(`/onboarding?prompt=${encodeURIComponent(text)}`);
    } else {
      router.push("/onboarding");
    }
  }, [prompt, router]);

  return (
    <section className="py-24 px-6" ref={ref}>
      <div
        className={`relative max-w-4xl mx-auto bg-gray-950 rounded-3xl px-8 sm:px-16 py-16 sm:py-20 overflow-hidden transition-all duration-700 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            What will you build?
          </h2>

          {/* Prompt card on dark */}
          <div className="max-w-lg mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-1">
              <div className="p-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your business and ideal funnel..."
                  rows={3}
                  className="w-full resize-none text-sm text-white placeholder:text-white/40 bg-transparent outline-none leading-relaxed"
                />
              </div>
              <div className="flex justify-end px-4 pb-4">
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 px-6 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md"
                >
                  Get started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
