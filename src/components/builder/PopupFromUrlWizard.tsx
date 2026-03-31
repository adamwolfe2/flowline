"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link2, Loader2, Check, Sparkles, Zap, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Phase = "input" | "generating" | "done";

interface WizardResult {
  funnelId: string;
  funnelSlug: string;
  campaignId: string;
  brandName: string;
}

interface PopupFromUrlWizardProps {
  onComplete: (result: WizardResult) => void;
  onCancel: () => void;
}

const STEPS = [
  "Analyzing your website",
  "Extracting brand identity",
  "Writing quiz questions",
  "Building your funnel",
  "Publishing & creating popup",
];

function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str.startsWith("http") ? str : `https://${str}`);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function PopupFromUrlWizard({ onComplete, onCancel }: PopupFromUrlWizardProps) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    if (!isValidUrl(normalizedUrl)) {
      setError("Please enter a valid website URL");
      return;
    }

    setPhase("generating");
    setActiveStep(0);
    setError(null);

    // Animate through steps while the API calls run
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);

    try {
      // Step 1: Generate funnel from URL via AI
      setActiveStep(0);
      const aiRes = await fetch("/api/ai/url-to-funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!aiRes.ok) {
        const data = await aiRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to analyze website");
      }

      const aiData = await aiRes.json();
      setActiveStep(2);

      // Step 2: Create the funnel
      setActiveStep(3);
      const funnelRes = await fetch("/api/funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: aiData.config,
          slug: aiData.slug,
        }),
      });

      if (!funnelRes.ok) {
        const data = await funnelRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create funnel");
      }

      const funnel = await funnelRes.json();

      // Step 3: Publish the funnel
      const publishRes = await fetch(`/api/funnels/${funnel.id}/publish`, {
        method: "POST",
      });

      if (!publishRes.ok) {
        throw new Error("Failed to publish funnel");
      }

      setActiveStep(4);

      // Step 4: Create the popup campaign
      const campaignRes = await fetch("/api/popup/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funnelId: funnel.id,
          name: `${aiData.brandName || "Website"} Popup`,
        }),
      });

      if (!campaignRes.ok) {
        const data = await campaignRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create popup campaign");
      }

      const campaign = await campaignRes.json();

      clearInterval(stepTimer);
      setActiveStep(STEPS.length - 1);
      setPhase("done");

      // Brief pause to show the completed state
      setTimeout(() => {
        onComplete({
          funnelId: funnel.id,
          funnelSlug: funnel.slug,
          campaignId: campaign.id,
          brandName: aiData.brandName || "Website",
        });
      }, 1200);
    } catch (err) {
      clearInterval(stepTimer);
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setPhase("input");
      toast.error(message);
    }
  }, [url, onComplete]);

  return (
    <div className="border border-[#E5E7EB] rounded-xl bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Create popup from website
                </h3>
                <p className="text-[11px] text-gray-400">
                  AI analyzes your site and builds a quiz popup in seconds
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && url.trim()) handleGenerate();
                  }}
                  placeholder="yourwebsite.com"
                  className="pl-9 text-sm h-9"
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={!url.trim()}
                className="bg-[#2D6A4F] hover:bg-[#245840] text-white h-9 px-4 text-sm gap-1.5"
              >
                Generate
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={onCancel}
              className="text-[11px] text-gray-400 hover:text-gray-600 mt-3 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {(phase === "generating" || phase === "done") && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 flex items-center justify-center">
                {phase === "done" ? (
                  <Check className="w-4 h-4 text-[#2D6A4F]" />
                ) : (
                  <Loader2 className="w-4 h-4 text-[#2D6A4F] animate-spin" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {phase === "done" ? "Popup ready" : "Building your popup"}
                </h3>
                <p className="text-[11px] text-gray-400 truncate max-w-[280px]">
                  {url}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {STEPS.map((step, i) => {
                const isDone = i < activeStep || phase === "done";
                const isActive = i === activeStep && phase === "generating";

                return (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.2 }}
                    className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#2D6A4F]/5"
                        : isDone
                          ? "bg-green-50/50"
                          : ""
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {isDone ? (
                        <div className="w-5 h-5 rounded-full bg-[#2D6A4F] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 text-[#2D6A4F] animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                      )}
                    </div>
                    <span
                      className={`text-xs ${
                        isDone
                          ? "text-gray-700 font-medium"
                          : isActive
                            ? "text-[#2D6A4F] font-medium"
                            : "text-gray-400"
                      }`}
                    >
                      {step}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {phase === "done" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 flex items-center gap-1.5 text-xs text-[#2D6A4F] font-medium"
              >
                <Zap className="w-3 h-3" />
                Ready — loading your campaign
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
