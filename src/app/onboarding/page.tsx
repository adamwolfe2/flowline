"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, CalendarCheck, Target, ArrowRight, Wand2, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "myvsl_onboarding_done";

const FEATURES = [
  {
    icon: Target,
    title: "Lead Scoring",
    description: "Automatically qualify leads based on quiz answers.",
  },
  {
    icon: CalendarCheck,
    title: "Calendar Routing",
    description: "Route high-value leads straight to booking.",
  },
  {
    icon: BarChart2,
    title: "Analytics",
    description: "Track conversions and optimize your funnel.",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const transition = { duration: 0.28, ease: "easeInOut" as const };

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Skip onboarding if already done
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) {
      router.replace("/dashboard");
      return;
    }

    // Skip if user already has funnels
    fetch("/api/funnels")
      .then(r => r.json())
      .then(data => {
        const funnels = Array.isArray(data) ? data : data?.funnels ?? [];
        if (funnels.length > 0) {
          router.replace("/dashboard");
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        setChecking(false);
      });
  }, [router]);

  function advance() {
    setDirection(1);
    setStep(s => s + 1);
  }

  function back() {
    setDirection(-1);
    setStep(s => s - 1);
  }

  function finish(path: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    router.push(path);
  }

  if (checking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="step-0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="text-center"
            >
              {/* Logo mark */}
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-8 flex items-center justify-center"
                style={{ backgroundColor: "#2D6A4F" }}
              >
                <Target className="w-7 h-7 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                Welcome to MyVSL
              </h1>
              <p className="text-base text-gray-500 mb-10">
                Let&apos;s get you set up in 2 minutes
              </p>

              {/* Feature highlights */}
              <div className="space-y-4 mb-10 text-left">
                {FEATURES.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#EBF5F0" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: "#2D6A4F" }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={advance}
                className="w-full h-11 text-sm font-medium gap-2"
                style={{ backgroundColor: "#2D6A4F" }}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <button
                onClick={back}
                className="text-xs text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                Back
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                How do you want to start?
              </h2>
              <p className="text-sm text-gray-500 mb-8">
                Choose how you&apos;d like to create your first funnel.
              </p>

              <div className="space-y-4">
                {/* Build with AI */}
                <button
                  onClick={() => finish("/build")}
                  className="w-full text-left p-5 rounded-xl border-2 border-gray-100 hover:border-[#2D6A4F] hover:bg-[#EBF5F0] transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: "#EBF5F0" }}
                    >
                      <Wand2 className="w-5 h-5" style={{ color: "#2D6A4F" }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">Build with AI</p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Describe your business and we&apos;ll generate a complete funnel
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#2D6A4F] ml-auto self-center flex-shrink-0 transition-colors" />
                  </div>
                </button>

                {/* Start from template */}
                <button
                  onClick={() => finish("/dashboard")}
                  className="w-full text-left p-5 rounded-xl border-2 border-gray-100 hover:border-[#2D6A4F] hover:bg-[#EBF5F0] transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: "#EBF5F0" }}
                    >
                      <LayoutTemplate className="w-5 h-5" style={{ color: "#2D6A4F" }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">Start from template</p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Choose from pre-built funnel templates
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#2D6A4F] ml-auto self-center flex-shrink-0 transition-colors" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {[0, 1].map(i => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 8,
                height: 8,
                backgroundColor: i === step ? "#2D6A4F" : "#E5E7EB",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
