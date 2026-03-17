"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto bg-gray-950 rounded-2xl px-8 py-16 md:px-16 md:py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
          What will you build?
        </h2>
        <p className="text-sm text-gray-400 mb-10 max-w-md mx-auto">
          Describe your business. AI builds your funnel. You start booking calls.
        </p>

        <div className="max-w-lg mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-xl p-1">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="I run a marketing agency that helps e-commerce brands scale with paid social..."
              rows={3}
              className="w-full px-4 py-3 text-sm text-white placeholder-gray-500 bg-transparent resize-none outline-none"
              style={{ fontSize: "16px" }}
            />
            <div className="flex justify-end px-2 pb-2">
              <button
                onClick={() => router.push(prompt ? `/onboarding?prompt=${encodeURIComponent(prompt)}` : "/onboarding")}
                className="bg-white text-gray-900 text-sm px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                Get started
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
