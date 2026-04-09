"use client";

import { useState, useReducer, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, ArrowRight, Sparkles, ChevronRight, Eye, X, Upload, Trash2, LayoutTemplate } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { deriveLightColor, deriveDarkColor } from "@/lib/colors";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const QuickStartPicker = dynamic(() => import("@/components/builder/QuickStartPicker"), { ssr: false });

// --- Types ---

interface PlanQuestion {
  id: string;
  text: string;
  type: "multiple_choice" | "text" | "url" | "color" | "logo";
  options?: string[];
}

interface ReasoningStep {
  label: string;
  status: "pending" | "active" | "done";
  detail?: string;
}

interface BuilderState {
  phase: "prompt" | "planning" | "questions" | "generating" | "preview";
  mode: "describe" | "url";
  businessDescription: string;
  thinking: string;
  questions: PlanQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  generatedData: Record<string, unknown> | null;
  primaryColor: string;
  buildStep: number;
  reasoningSteps: ReasoningStep[];
  error: string | null;
}

type BuilderAction =
  | { type: "SET_DESCRIPTION"; value: string }
  | { type: "SET_MODE"; mode: "describe" | "url" }
  | { type: "START_PLANNING" }
  | { type: "SET_REASONING"; steps: ReasoningStep[] }
  | { type: "PLAN_READY"; thinking: string; questions: PlanQuestion[] }
  | { type: "ANSWER_QUESTION"; questionId: string; answer: string }
  | { type: "NEXT_QUESTION" }
  | { type: "SKIP_QUESTION" }
  | { type: "START_GENERATING" }
  | { type: "SET_BUILD_STEP"; step: number }
  | { type: "GENERATION_DONE"; data: Record<string, unknown>; color: string }
  | { type: "SET_ERROR"; error: string }
  | { type: "RESET" };

const COLOR_PRESETS = [
  { label: "Forest", color: "#2D6A4F" },
  { label: "Ocean", color: "#2563EB" },
  { label: "Violet", color: "#7C3AED" },
  { label: "Teal", color: "#0891B2" },
  { label: "Coral", color: "#DC2626" },
  { label: "Amber", color: "#D97706" },
  { label: "Indigo", color: "#4F46E5" },
  { label: "Slate", color: "#0F172A" },
];

const BUILD_STEPS = [
  "Writing your headline...",
  "Crafting qualifying questions...",
  "Setting up lead scoring...",
  "Configuring calendar routing...",
  "Rendering your funnel...",
];

function reducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "SET_DESCRIPTION":
      return { ...state, businessDescription: action.value };
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "START_PLANNING":
      return { ...state, phase: "planning", error: null, reasoningSteps: [] };
    case "SET_REASONING":
      return { ...state, reasoningSteps: action.steps };
    case "PLAN_READY":
      return {
        ...state,
        phase: "questions",
        thinking: action.thinking,
        questions: [
          ...action.questions,
          { id: "logo_url", text: "Upload your logo (optional)", type: "logo" },
          { id: "calendar_url", text: "Do you have a booking link? (Cal.com, Calendly, etc.)", type: "url" },
          { id: "brand_color", text: "Pick a brand color for your funnel", type: "color" },
        ],
        currentQuestionIndex: 0,
      };
    case "ANSWER_QUESTION":
      return { ...state, answers: { ...state.answers, [action.questionId]: action.answer } };
    case "NEXT_QUESTION": {
      const next = state.currentQuestionIndex + 1;
      if (next >= state.questions.length) {
        return { ...state, phase: "generating", currentQuestionIndex: next };
      }
      return { ...state, currentQuestionIndex: next };
    }
    case "SKIP_QUESTION": {
      const next = state.currentQuestionIndex + 1;
      if (next >= state.questions.length) {
        return { ...state, phase: "generating", currentQuestionIndex: next };
      }
      return { ...state, currentQuestionIndex: next };
    }
    case "START_GENERATING":
      return { ...state, phase: "generating", buildStep: 0 };
    case "SET_BUILD_STEP":
      return { ...state, buildStep: action.step };
    case "GENERATION_DONE":
      return { ...state, phase: "preview", generatedData: action.data, primaryColor: action.color };
    case "SET_ERROR":
      return { ...state, phase: "prompt", error: action.error };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const URL_BUILD_STEPS = [
  "Scraping website content...",
  "Extracting brand identity...",
  "Analyzing your business...",
  "Generating quiz questions...",
  "Building your funnel...",
];

const initialState: BuilderState = {
  phase: "prompt",
  mode: "describe",
  businessDescription: "",
  thinking: "",
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  generatedData: null,
  primaryColor: "#2D6A4F",
  buildStep: 0,
  reasoningSteps: [],
  error: null,
};

// --- Components ---

function PhaseIndicator({ phase }: { phase: BuilderState["phase"] }) {
  const phases = ["prompt", "planning", "questions", "generating", "preview"] as const;
  const labels = ["Describe", "Plan", "Questions", "Build", "Preview"];
  const currentIdx = phases.indexOf(phase);

  return (
    <div className="flex items-center gap-1.5">
      {phases.map((p, i) => (
        <div key={p} className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full transition-colors ${
            i < currentIdx ? "bg-[#2D6A4F]" :
            i === currentIdx ? "bg-[#2D6A4F] ring-2 ring-[#2D6A4F]/20" :
            "bg-[#D1D5DB]"
          }`} />
          <span className={`text-[10px] font-medium hidden sm:inline ${
            i <= currentIdx ? "text-[#2D6A4F]" : "text-[#D1D5DB]"
          }`}>{labels[i]}</span>
          {i < phases.length - 1 && (
            <div className={`w-4 h-px ${i < currentIdx ? "bg-[#2D6A4F]" : "bg-[#D1D5DB]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function MultipleChoiceInput({ options, selected, onSelect }: { options: string[]; selected?: string; onSelect: (v: string) => void }) {
  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <button key={opt} onClick={() => onSelect(opt)}
          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
            selected === opt
              ? "border-[#2D6A4F] bg-[#2D6A4F]/5 text-[#111827]"
              : "border-[#E5E7EB] text-[#374151] hover:border-[#9CA3AF] hover:bg-[#F9FAFB]"
          }`}>
          <span className="w-5 h-5 rounded-md border flex items-center justify-center text-[10px] font-medium flex-shrink-0" style={{
            borderColor: selected === opt ? "#2D6A4F" : "#D1D5DB",
            backgroundColor: selected === opt ? "#2D6A4F" : "transparent",
            color: selected === opt ? "white" : "#9CA3AF",
          }}>
            {String.fromCharCode(65 + i)}
          </span>
          {opt}
        </button>
      ))}
    </div>
  );
}

function ColorPickerInput({ selected, onSelect }: { selected?: string; onSelect: (v: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {COLOR_PRESETS.map((c) => (
        <button key={c.color} onClick={() => onSelect(c.color)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
            selected === c.color ? "border-[#2D6A4F] bg-[#F9FAFB]" : "border-[#E5E7EB] hover:border-[#9CA3AF]"
          }`}>
          <div className="w-8 h-8 rounded-full border border-black/10" style={{ backgroundColor: c.color }} />
          <span className="text-[10px] text-[#6B7280]">{c.label}</span>
        </button>
      ))}
    </div>
  );
}

function LogoUploadInput({ logoUrl, onUpload, onRemove }: { logoUrl: string; onUpload: (url: string) => void; onRemove: () => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/logo", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onUpload(data.url);
    } catch {
      toast.error("Failed to upload logo");
    }
    setUploading(false);
  }

  if (logoUrl) {
    return (
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl border border-[#E5E7EB] overflow-hidden bg-[#F9FAFB] flex items-center justify-center">
          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-[#6B7280] mb-2">Logo uploaded</p>
          <button onClick={onRemove} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors">
            <Trash2 className="w-3 h-3" /> Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <label className={`flex flex-col items-center gap-2 border-2 border-dashed border-[#E5E7EB] rounded-xl p-6 cursor-pointer hover:border-[#2D6A4F] hover:bg-[#F9FAFB] transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
      <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
      {uploading ? (
        <Loader2 className="w-6 h-6 text-[#2D6A4F] animate-spin" />
      ) : (
        <Upload className="w-6 h-6 text-[#9CA3AF]" />
      )}
      <span className="text-xs text-[#6B7280]">{uploading ? "Uploading..." : "Click to upload or drag & drop"}</span>
      <span className="text-[10px] text-[#9CA3AF]">PNG, JPG, SVG up to 2MB</span>
    </label>
  );
}

function LivePreview({ answers, description }: { answers: Record<string, string>; description: string }) {
  const color = answers.brand_color || "#2D6A4F";
  const logoUrl = answers.logo_url || "";
  const businessType = answers.business_type || "";
  const audience = answers.target_audience || "";
  const offering = answers.offering || "";
  const hasContent = businessType || audience || offering;

  return (
    <div className="w-full max-w-lg">
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
        <div className="p-8 text-center">
          {/* Logo */}
          {logoUrl ? (
            <div className="w-12 h-12 rounded-xl mx-auto mb-4 overflow-hidden border border-[#E5E7EB]">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-white font-bold transition-colors duration-300"
              style={{ backgroundColor: color }}>
              {(businessType || description || "M")[0].toUpperCase()}
            </div>
          )}

          {/* Badge */}
          <div className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3 transition-colors duration-300"
            style={{ backgroundColor: color + "15", color }}>
            Free Assessment
          </div>

          {/* Headline — real or skeleton */}
          {hasContent ? (
            <motion.h3 key={businessType + audience} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-lg font-bold text-[#111827] leading-tight mb-2">
              {businessType ? `Is Your ${businessType} Ready to Scale?` : "Find Out If You Qualify"}
            </motion.h3>
          ) : (
            <div className="h-6 bg-[#E5E7EB] rounded w-3/4 mx-auto mb-2 animate-pulse" />
          )}

          {/* Subheadline */}
          {audience ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-sm text-[#6B7280] mb-6">
              Answer 3 quick questions to see if we are the right fit.
            </motion.p>
          ) : (
            <div className="h-4 bg-[#E5E7EB] rounded w-1/2 mx-auto mb-6 animate-pulse" />
          )}

          {/* CTA Button */}
          <button className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-colors duration-300"
            style={{ backgroundColor: color }}>
            Take the Quiz
          </button>
        </div>

        {/* Question preview */}
        <div className="border-t border-[#E5E7EB] p-6">
          <div className={hasContent ? "opacity-50" : "opacity-30 animate-pulse"}>
            <p className="text-xs text-[#9CA3AF] mb-1">Question 1 of 3</p>
            <p className="text-sm font-medium text-[#111827] mb-3">
              {businessType ? `What stage is your ${businessType.toLowerCase()} business?` : "Loading question..."}
            </p>
            <div className="space-y-1.5">
              <div className="text-xs px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#6B7280]">Just starting out</div>
              <div className="text-xs px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#6B7280]">Growing steadily</div>
              <div className="text-xs px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#6B7280]">Ready to scale</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FunnelPreview({ data, color, logoUrl }: { data: Record<string, unknown>; color: string; logoUrl?: string }) {
  return (
    <div className="w-full max-w-lg">
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
        <div className="p-8 text-center">
          {logoUrl ? (
            <div className="w-12 h-12 rounded-xl mx-auto mb-4 overflow-hidden border border-[#E5E7EB]">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: color }}>
              {((data.brandName as string) || "M")[0].toUpperCase()}
            </div>
          )}
          <div className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3"
            style={{ backgroundColor: deriveLightColor(color), color }}>
            Free Assessment
          </div>
          <h3 className="text-xl font-bold text-[#111827] leading-tight mb-2">
            {(data.headline as string) || "Your Headline"}
          </h3>
          <p className="text-sm text-[#6B7280] mb-6">
            {(data.subheadline as string) || "Your subheadline"}
          </p>
          <button className="w-full py-3 rounded-xl text-white font-semibold text-sm"
            style={{ backgroundColor: color }}>
            Take the Quiz
          </button>
        </div>
        <div className="relative border-t border-[#E5E7EB] p-6">
          <div className="blur-sm opacity-40">
            <p className="text-xs text-[#9CA3AF] mb-1">Question 1 of 3</p>
            <p className="text-sm font-medium text-[#111827] mb-3">
              {((data.questions as Array<{text: string}>)?.[0]?.text) || "First question"}
            </p>
            {((data.questions as Array<{options: Array<{label: string}>}>)?.[0]?.options || []).slice(0, 3).map((opt, i) => (
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
    </div>
  );
}

// --- Main Builder ---

function BuildContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const initialUrl = searchParams.get("url") || "";
  const modeParam = searchParams.get("mode");

  const [activeTab, setActiveTab] = useState<"ai" | "template">(
    modeParam === "template" ? "template" : "ai"
  );

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    businessDescription: initialPrompt || initialUrl,
    mode: initialUrl ? "url" : "describe",
  });

  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [autoStarted, setAutoStarted] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [describeError, setDescribeError] = useState("");

  // BUG-003: Reset textInput when question changes so prior input doesn't bleed through
  useEffect(() => {
    const currentQ = state.questions[state.currentQuestionIndex];
    if (currentQ?.type === "text" || currentQ?.type === "url") {
      setTextInput(state.answers[currentQ.id] || "");
    } else {
      setTextInput("");
    }
  }, [state.currentQuestionIndex, state.questions, state.answers]);

  // Auto-start if prompt or URL came from homepage
  useEffect(() => {
    if (autoStarted) return;
    if (initialUrl && initialUrl.length > 5) {
      setAutoStarted(true);
      startUrlGeneration(initialUrl);
    } else if (initialPrompt && initialPrompt.length > 10) {
      setAutoStarted(true);
      startPlanning(initialPrompt);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function startPlanning(desc?: string) {
    const text = desc || state.businessDescription;
    if (text.length < 10) {
      setDescribeError("Please describe your business in at least 10 characters.");
      return;
    }
    setDescribeError("");

    dispatch({ type: "SET_DESCRIPTION", value: text });
    dispatch({ type: "START_PLANNING" });

    // Progressive reasoning steps during planning
    const planSteps: ReasoningStep[] = [
      { label: "Reading your business description", status: "active" },
      { label: "Identifying your industry", status: "pending" },
      { label: "Mapping your target audience", status: "pending" },
      { label: "Preparing clarifying questions", status: "pending" },
    ];
    dispatch({ type: "SET_REASONING", steps: [...planSteps] });

    try {
      const fetchPromise = fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      // Animate through reasoning steps while API call runs
      for (let i = 0; i < planSteps.length - 1; i++) {
        await new Promise(r => setTimeout(r, 700));
        planSteps[i].status = "done";
        planSteps[i + 1].status = "active";
        dispatch({ type: "SET_REASONING", steps: [...planSteps] });
      }

      const res = await fetchPromise;
      if (res.status === 429) {
        toast.error("You've hit the rate limit for AI generation. Please wait a minute and try again.");
        dispatch({ type: "SET_ERROR", error: "Rate limited" });
        return;
      }
      if (!res.ok) throw new Error("Planning failed");
      const data = await res.json();

      // Mark last step done
      planSteps[planSteps.length - 1].status = "done";
      dispatch({ type: "SET_REASONING", steps: [...planSteps] });
      await new Promise(r => setTimeout(r, 400));

      dispatch({
        type: "PLAN_READY",
        thinking: data.thinking || "Let me gather some details to build the perfect funnel for you.",
        questions: data.questions || [],
      });
    } catch {
      toast.error("Failed to analyze your business. Please try again.");
      dispatch({ type: "SET_ERROR", error: "Planning failed" });
    }
  }

  async function startUrlGeneration(inputUrl?: string) {
    let url = inputUrl || urlInput;
    if (!url || url.trim().length < 4) return;

    if (!/^https?:\/\//i.test(url.trim())) {
      url = `https://${url.trim()}`;
    }

    dispatch({ type: "SET_DESCRIPTION", value: url });
    dispatch({ type: "SET_MODE", mode: "url" });
    dispatch({ type: "START_PLANNING" });

    // URL generation reasoning steps
    const urlSteps: ReasoningStep[] = [
      { label: "Scraping website content", status: "active" },
      { label: "Extracting brand identity", status: "pending" },
      { label: "Analyzing your business", status: "pending" },
      { label: "Generating quiz questions", status: "pending" },
      { label: "Building your funnel", status: "pending" },
    ];
    dispatch({ type: "SET_REASONING", steps: [...urlSteps] });

    try {
      const fetchPromise = fetch("/api/ai/url-to-funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      // Animate through steps while API call runs
      for (let i = 0; i < urlSteps.length - 1; i++) {
        await new Promise((r) => setTimeout(r, 1200));
        urlSteps[i].status = "done";
        urlSteps[i + 1].status = "active";
        dispatch({ type: "SET_REASONING", steps: [...urlSteps] });
      }

      const res = await fetchPromise;
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "URL generation failed");
      }

      const data = await res.json();

      // Mark all done
      urlSteps[urlSteps.length - 1].status = "done";
      dispatch({ type: "SET_REASONING", steps: [...urlSteps] });
      await new Promise((r) => setTimeout(r, 300));

      const color = data.config?.brand?.primaryColor || "#2D6A4F";
      const generatedData = {
        brandName: data.brandName || data.config?.brand?.name || "",
        headline: data.config?.quiz?.headline || "",
        subheadline: data.config?.quiz?.subheadline || "",
        questions: data.config?.quiz?.questions || [],
        thresholds: data.config?.quiz?.thresholds || { high: 7, mid: 4 },
        metaDescription: data.config?.meta?.description || "",
        badgeText: data.config?.quiz?.badgeText || "FREE ASSESSMENT",
        ctaButtonText: data.config?.quiz?.ctaButtonText || "Take the Quiz",
      };

      dispatch({ type: "GENERATION_DONE", data: generatedData, color });

      // Store logo URL as an answer so the preview shows it
      if (data.logoUrl) {
        dispatch({ type: "ANSWER_QUESTION", questionId: "logo_url", answer: data.logoUrl });
      }

      // Save to localStorage
      localStorage.setItem(
        "myvsl_pending_funnel",
        JSON.stringify({
          config: data.config,
          slug: data.slug,
        })
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : "URL generation failed";
      toast.error(msg);
      dispatch({ type: "SET_ERROR", error: msg });
    }
  }

  function handleAnswer(questionId: string, answer: string) {
    dispatch({ type: "ANSWER_QUESTION", questionId, answer });
  }

  function handleNext() {
    const currentQ = state.questions[state.currentQuestionIndex];
    if (!currentQ) return;

    // Save text/url input before checking advancement
    if (currentQ.type === "text" || currentQ.type === "url") {
      if (textInput.trim()) {
        dispatch({ type: "ANSWER_QUESTION", questionId: currentQ.id, answer: textInput.trim() });
      }
      setTextInput("");
    }
    // Default color if not picked
    if (currentQ.type === "color" && !state.answers[currentQ.id]) {
      dispatch({ type: "ANSWER_QUESTION", questionId: currentQ.id, answer: "#2D6A4F" });
    }

    // Guard: require an answer for multiple_choice questions
    if (currentQ.type === "multiple_choice" && !state.answers[currentQ.id]) {
      return;
    }

    const isLast = state.currentQuestionIndex >= state.questions.length - 1;
    dispatch({ type: "NEXT_QUESTION" });
    if (isLast) {
      startGenerating();
    }
  }

  function handleSkip() {
    setTextInput("");
    const isLast = state.currentQuestionIndex >= state.questions.length - 1;
    dispatch({ type: "SKIP_QUESTION" });
    if (isLast) {
      startGenerating();
    }
  }

  async function startGenerating() {
    // Set up reasoning steps for the generation phase
    const genSteps: ReasoningStep[] = [
      { label: "Analyzing your answers", status: "active", detail: `${Object.keys(state.answers).filter(k => state.answers[k]).length} inputs gathered` },
      { label: "Writing your headline", status: "pending" },
      { label: "Crafting qualifying questions", status: "pending", detail: "Budget, timeline, and fit" },
      { label: "Setting up lead scoring", status: "pending", detail: "3-tier scoring system" },
      { label: "Configuring calendar routing", status: "pending" },
      { label: "Assembling your funnel", status: "pending" },
    ];
    dispatch({ type: "SET_REASONING", steps: [...genSteps] });

    try {
      const color = state.answers.brand_color || "#2D6A4F";

      const fetchPromise = fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: state.businessDescription,
          context: {
            businessType: state.answers.business_type,
            targetAudience: state.answers.target_audience,
            offering: state.answers.offering,
            calendarUrl: state.answers.calendar_url,
            brandColor: color,
          },
        }),
      });

      // Animate reasoning steps while API call runs
      for (let i = 0; i < genSteps.length - 1; i++) {
        await new Promise(r => setTimeout(r, 800));
        genSteps[i].status = "done";
        genSteps[i + 1].status = "active";
        dispatch({ type: "SET_REASONING", steps: [...genSteps] });
        dispatch({ type: "SET_BUILD_STEP", step: i + 1 });
      }

      const res = await fetchPromise;
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();

      // Mark all done
      genSteps[genSteps.length - 1].status = "done";
      dispatch({ type: "SET_REASONING", steps: [...genSteps] });
      await new Promise(r => setTimeout(r, 300));

      dispatch({ type: "GENERATION_DONE", data, color });

      // Save to localStorage
      localStorage.setItem("myvsl_pending_funnel", JSON.stringify({
        config: {
          brand: {
            name: data.brandName || state.businessDescription.split(" ").slice(0, 3).join(" "),
            logoUrl: state.answers.logo_url || "",
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
            calendars: {
              high: state.answers.calendar_url || "",
              mid: state.answers.calendar_url || "",
              low: state.answers.calendar_url || "",
            },
          },
          webhook: { url: "" },
          meta: { title: `Apply | ${data.brandName || "My Business"}`, description: data.metaDescription || "" },
        },
        slug: (data.brandName || "my-funnel").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30),
      }));
    } catch {
      toast.error("Generation failed. Please try again.");
      dispatch({ type: "SET_ERROR", error: "Generation failed" });
    }
  }

  const currentQ = state.questions[state.currentQuestionIndex];
  const canAdvance = currentQ && (
    state.answers[currentQ.id] ||
    currentQ.type === "color" ||
    currentQ.type === "url" ||
    currentQ.type === "logo" ||
    (currentQ.type === "text" && textInput.trim().length > 0)
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="h-14 border-b border-[#E5E7EB] flex items-center justify-between px-4 md:px-6 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="MyVSL" width={20} height={20} />
          <span className="font-semibold text-[#111827] text-sm">MyVSL</span>
        </Link>
        <PhaseIndicator phase={state.phase} />
        <div className="flex items-center gap-2 sm:gap-3">
          {state.phase === "preview" && (
            <Link href="/sign-up" className="bg-[#2D6A4F] text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-[#245840] transition-colors flex items-center gap-1.5 min-h-[44px]">
              <span className="hidden sm:inline">Save & Publish</span>
              <span className="sm:hidden">Save</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link href="/sign-in" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors hidden sm:block">
            Sign in
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-full lg:w-[420px] xl:w-[460px] border-r border-[#E5E7EB] flex flex-col flex-shrink-0 overflow-y-auto">

          {/* Tab switcher */}
          <div className="flex border-b border-[#E5E7EB] px-4 pt-3 gap-1">
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                activeTab === "ai"
                  ? "text-[#2D6A4F] border-[#2D6A4F] bg-[#F9FAFB]"
                  : "text-[#6B7280] border-transparent hover:text-[#111827]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Builder
            </button>
            <button
              onClick={() => setActiveTab("template")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                activeTab === "template"
                  ? "text-[#2D6A4F] border-[#2D6A4F] bg-[#F9FAFB]"
                  : "text-[#6B7280] border-transparent hover:text-[#111827]"
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              Quick Start Templates
            </button>
          </div>

          {/* Quick Start Templates tab */}
          {activeTab === "template" && <QuickStartPicker />}

          {/* AI Builder tab */}
          {activeTab === "ai" && <>

          {/* Phase: Prompt */}
          {state.phase === "prompt" && (
            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#2D6A4F]/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
                </div>
                <span className="text-sm font-semibold text-[#111827]">AI Builder</span>
              </div>

              {/* Mode tabs */}
              <div className="flex border border-[#E5E7EB] rounded-lg p-0.5 mb-4">
                <button
                  onClick={() => dispatch({ type: "SET_MODE", mode: "describe" })}
                  className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${
                    state.mode === "describe"
                      ? "bg-[#2D6A4F] text-white"
                      : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  Describe
                </button>
                <button
                  onClick={() => dispatch({ type: "SET_MODE", mode: "url" })}
                  className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${
                    state.mode === "url"
                      ? "bg-[#2D6A4F] text-white"
                      : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  Website URL
                </button>
              </div>

              {state.mode === "describe" ? (
                <>
                  <p className="text-sm text-[#6B7280] mb-4">
                    Describe your business and who you serve. The more detail you give, the better your funnel will be.
                  </p>
                  <textarea
                    value={state.businessDescription}
                    onChange={(e) => { dispatch({ type: "SET_DESCRIPTION", value: e.target.value }); if (describeError) setDescribeError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); startPlanning(); } }}
                    placeholder="I run a coaching business helping SaaS founders scale from $50k to $500k MRR through outbound sales systems..."
                    rows={5}
                    className="w-full text-sm text-[#111827] placeholder-[#9CA3AF] resize-none outline-none border border-[#E5E7EB] rounded-xl p-4 focus:border-[#2D6A4F] transition-colors"
                    style={{ fontSize: "15px" }}
                    aria-label="Describe your business"
                  />
                  {describeError && <p className="text-xs text-red-500 mt-1">{describeError}</p>}
                  <button onClick={() => startPlanning()} disabled={state.businessDescription.length < 10}
                    className="w-full mt-4 py-3 bg-[#2D6A4F] hover:bg-[#245840] disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Start Building
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-[#6B7280] mb-4">
                    Paste your website URL and we will scrape it to auto-generate a complete funnel with your branding, quiz questions, and lead scoring.
                  </p>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                    </div>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); startUrlGeneration(); } }}
                      placeholder="https://yourwebsite.com"
                      className="w-full text-sm text-[#111827] placeholder-[#9CA3AF] outline-none border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-3.5 focus:border-[#2D6A4F] transition-colors"
                      style={{ fontSize: "15px" }}
                      aria-label="Paste your website URL"
                    />
                  </div>
                  <button onClick={() => startUrlGeneration()} disabled={!urlInput || urlInput.trim().length < 4}
                    className="w-full mt-4 py-3 bg-[#2D6A4F] hover:bg-[#245840] disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    Generate from Website
                  </button>
                </>
              )}
              <p className="text-xs text-[#9CA3AF] text-center mt-3">
                Free to build. No account required.
              </p>
            </div>
          )}

          {/* Phase: Planning */}
          {state.phase === "planning" && (
            <div className="p-6 flex-1">
              {/* User's description */}
              <div className="bg-[#F9FAFB] rounded-xl px-4 py-3 border border-[#E5E7EB] mb-5">
                <p className="text-sm text-[#111827] break-all">{state.businessDescription}</p>
              </div>

              {/* AI header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-[#2D6A4F] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-[#111827]">
                  {state.mode === "url" ? "Generating from website" : "Planning"}
                </span>
              </div>

              {/* Reasoning steps */}
              <div className="space-y-2.5">
                {state.reasoningSteps.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: step.status === "pending" ? 0.35 : 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2.5">
                    {step.status === "done" ? (
                      <div className="w-5 h-5 rounded-full bg-[#2D6A4F] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : step.status === "active" ? (
                      <Loader2 className="w-5 h-5 text-[#2D6A4F] animate-spin flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#E5E7EB] flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className={`text-sm ${step.status !== "pending" ? "text-[#111827]" : "text-[#9CA3AF]"}`}>
                        {step.label}
                      </span>
                      {step.detail && step.status === "done" && (
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">{step.detail}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Phase: Questions */}
          {state.phase === "questions" && (
            <div className="flex-1 flex flex-col">
              {/* User's description at top */}
              <div className="p-4 border-b border-[#E5E7EB]">
                <div className="bg-[#F9FAFB] rounded-xl px-4 py-3 border border-[#E5E7EB]">
                  <p className="text-sm text-[#111827] line-clamp-2">{state.businessDescription}</p>
                </div>
              </div>

              {/* AI thinking text */}
              {state.thinking && (
                <div className="px-6 pt-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-6 h-6 rounded-md bg-[#2D6A4F]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    </div>
                    <p className="text-xs text-[#6B7280] italic">{state.thinking}</p>
                  </div>
                </div>
              )}

              {/* Answered questions summary */}
              <div className="px-6 space-y-3">
                {state.questions.slice(0, state.currentQuestionIndex).map((q) => (
                  <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs">
                    <Check className="w-4 h-4 text-[#2D6A4F] flex-shrink-0" />
                    <span className="text-[#9CA3AF]">{q.text}</span>
                    <span className="text-[#111827] font-medium ml-auto truncate max-w-[160px]">
                      {q.type === "color" ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full border border-black/10 inline-block" style={{ backgroundColor: state.answers[q.id] }} />
                          {COLOR_PRESETS.find(c => c.color === state.answers[q.id])?.label || state.answers[q.id]}
                        </span>
                      ) : state.answers[q.id] || "Skipped"}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Current question */}
              {currentQ && (
                <div className="flex-1 flex flex-col p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#2D6A4F] flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">{state.currentQuestionIndex + 1}</span>
                      </div>
                      <span className="text-xs text-[#9CA3AF]">of {state.questions.length}</span>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={currentQ.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.2 }}>

                      <p className="text-sm font-semibold text-[#111827] mb-4">{currentQ.text}</p>

                      {currentQ.type === "multiple_choice" && currentQ.options && (
                        <MultipleChoiceInput
                          options={currentQ.options}
                          selected={state.answers[currentQ.id]}
                          onSelect={(v) => handleAnswer(currentQ.id, v)}
                        />
                      )}

                      {currentQ.type === "text" && (
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleNext(); } }}
                          placeholder="e.g., We help them build a predictable outbound pipeline"
                          className="w-full text-sm text-[#111827] placeholder-[#9CA3AF] outline-none border border-[#E5E7EB] rounded-xl p-3 focus:border-[#2D6A4F] transition-colors"
                          autoFocus
                        />
                      )}

                      {currentQ.type === "url" && (
                        <>
                          <input
                            type="url"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleNext(); } }}
                            placeholder="https://cal.com/you/discovery-call"
                            className="w-full text-sm text-[#111827] placeholder-[#9CA3AF] outline-none border border-[#E5E7EB] rounded-xl p-3 focus:border-[#2D6A4F] transition-colors"
                            autoFocus
                          />
                          <p className="text-xs text-[#9CA3AF] mt-1">Enter your booking link to auto-route qualified leads, or skip to continue.</p>
                        </>
                      )}

                      {currentQ.type === "color" && (
                        <ColorPickerInput
                          selected={state.answers[currentQ.id]}
                          onSelect={(v) => handleAnswer(currentQ.id, v)}
                        />
                      )}

                      {currentQ.type === "logo" && (
                        <LogoUploadInput
                          logoUrl={state.answers[currentQ.id] || ""}
                          onUpload={(url) => handleAnswer(currentQ.id, url)}
                          onRemove={() => {
                            dispatch({ type: "ANSWER_QUESTION", questionId: currentQ.id, answer: "" });
                          }}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation buttons */}
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#E5E7EB]">
                    {(currentQ.type === "url" || currentQ.type === "color" || currentQ.type === "logo") && (
                      <button onClick={handleSkip} className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                        Skip
                      </button>
                    )}
                    <button onClick={handleNext} disabled={!canAdvance}
                      className="ml-auto flex items-center gap-1.5 bg-[#2D6A4F] hover:bg-[#245840] disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all">
                      {state.currentQuestionIndex === state.questions.length - 1 ? "Generate" : "Next"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Phase: Generating */}
          {state.phase === "generating" && (
            <div className="p-6 flex-1">
              <div className="bg-[#F9FAFB] rounded-xl px-4 py-3 border border-[#E5E7EB] mb-5">
                <p className="text-sm text-[#111827] line-clamp-2">{state.businessDescription}</p>
              </div>

              {/* AI header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-[#2D6A4F] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-[#111827]">Building your funnel</span>
              </div>

              {/* Key decisions */}
              {state.answers.business_type && (
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2.5 mb-4">
                  <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Context gathered</p>
                  <div className="space-y-1 text-xs text-[#374151]">
                    {state.answers.business_type && <p>Industry: <span className="font-medium">{state.answers.business_type}</span></p>}
                    {state.answers.target_audience && <p>Audience: <span className="font-medium">{state.answers.target_audience}</span></p>}
                    {state.answers.offering && <p>Offer: <span className="font-medium">{state.answers.offering}</span></p>}
                  </div>
                </div>
              )}

              {/* Reasoning steps */}
              <div className="space-y-2.5">
                {state.reasoningSteps.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: step.status === "pending" ? 0.35 : 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2.5">
                    {step.status === "done" ? (
                      <div className="w-5 h-5 rounded-full bg-[#2D6A4F] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : step.status === "active" ? (
                      <Loader2 className="w-5 h-5 text-[#2D6A4F] animate-spin flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#E5E7EB] flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className={`text-sm ${step.status !== "pending" ? "text-[#111827]" : "text-[#9CA3AF]"}`}>
                        {step.label}
                      </span>
                      {step.detail && step.status !== "pending" && (
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">{step.detail}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Phase: Preview */}
          {state.phase === "preview" && (
            <div className="flex-1 flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-[#2D6A4F] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-[#111827]">Your funnel is ready</span>
                </div>

                {/* Summary of what was gathered */}
                <div className="space-y-3 mb-6">
                  {state.answers.logo_url && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#9CA3AF]">Logo:</span>
                      <img src={state.answers.logo_url} alt="Logo" className="w-8 h-8 rounded-lg border border-[#E5E7EB] object-contain p-0.5" />
                    </div>
                  )}
                  {state.answers.business_type && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#9CA3AF]">Business:</span>
                      <span className="text-[#111827] font-medium">{state.answers.business_type}</span>
                    </div>
                  )}
                  {state.answers.target_audience && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#9CA3AF]">Audience:</span>
                      <span className="text-[#111827] font-medium">{state.answers.target_audience}</span>
                    </div>
                  )}
                  {state.answers.offering && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#9CA3AF]">Offer:</span>
                      <span className="text-[#111827] font-medium">{state.answers.offering}</span>
                    </div>
                  )}
                  {state.answers.calendar_url && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#9CA3AF]">Calendar:</span>
                      <span className="text-[#111827] font-medium truncate max-w-[200px]">{state.answers.calendar_url}</span>
                    </div>
                  )}
                  {state.answers.brand_color && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#9CA3AF]">Color:</span>
                      <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: state.answers.brand_color }} />
                    </div>
                  )}
                </div>

                {/* Generated questions list */}
                {state.generatedData && (
                  <div className="border-t border-[#E5E7EB] pt-4">
                    <p className="text-xs text-[#9CA3AF] mb-2">Generated quiz questions:</p>
                    {((state.generatedData.questions as Array<{text: string}>) || []).map((q, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#6B7280] py-1">
                        <span className="text-[#9CA3AF] flex-shrink-0">{i + 1}.</span>
                        <span>{q.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-[#E5E7EB]">
                <Link href="/sign-up"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#2D6A4F] text-white text-sm font-semibold rounded-xl hover:bg-[#245840] transition-colors">
                  Save & Publish My Funnel <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-center text-[10px] text-[#9CA3AF] mt-2">Free plan. No credit card required.</p>
              </div>
            </div>
          )}
          </>}
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 bg-[#F9FAFB] flex items-center justify-center p-6 md:p-10 overflow-y-auto hidden lg:flex">
          <AnimatePresence mode="wait">
            {activeTab === "template" && (
              <motion.div key="template-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center max-w-sm">
                <div className="w-16 h-16 bg-[#2D6A4F]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LayoutTemplate className="w-8 h-8 text-[#2D6A4F]" />
                </div>
                <p className="text-lg font-semibold text-[#111827] mb-2" style={{ fontFamily: "var(--font-instrument-serif)" }}>
                  Start from a proven template
                </p>
                <p className="text-sm text-[#9CA3AF]">
                  Choose your industry, pick a funnel type, and fill in your details — your funnel will be ready in seconds.
                </p>
              </motion.div>
            )}
            {activeTab === "ai" && state.phase === "prompt" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center max-w-sm">
                <div className="w-16 h-16 bg-[#2D6A4F]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#2D6A4F]" />
                </div>
                <p className="text-lg font-semibold text-[#111827] mb-2" style={{ fontFamily: "var(--font-instrument-serif)" }}>
                  Your funnel will appear here
                </p>
                <p className="text-sm text-[#9CA3AF]">
                  Describe your business on the left to get started
                </p>
              </motion.div>
            )}

            {(state.phase === "planning" || state.phase === "questions") && (
              <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LivePreview answers={state.answers} description={state.businessDescription} />
              </motion.div>
            )}

            {state.phase === "generating" && (
              <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center">
                <div className="w-12 h-12 border-2 border-[#E5E7EB] border-t-[#2D6A4F] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium text-[#111827] mb-1">Crafting your funnel</p>
                <p className="text-xs text-[#9CA3AF]">
                  {state.reasoningSteps.find(s => s.status === "active")?.label || "Assembling..."}
                </p>
              </motion.div>
            )}

            {state.phase === "preview" && state.generatedData && (
              <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <FunnelPreview data={state.generatedData} color={state.primaryColor} logoUrl={state.answers.logo_url} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile preview toggle button */}
      {state.phase !== "prompt" && (
        <button
          onClick={() => setShowMobilePreview(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-12 h-12 bg-[#2D6A4F] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#245840] transition-colors"
          aria-label="Preview funnel"
        >
          <Eye className="w-5 h-5" />
        </button>
      )}

      {/* Mobile preview overlay */}
      <AnimatePresence>
        {showMobilePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMobilePreview(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-[#F9FAFB] rounded-t-2xl max-h-[85vh] overflow-y-auto p-6 pt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-[#111827]">Preview</span>
                <button onClick={() => setShowMobilePreview(false)} className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center" aria-label="Close preview">
                  <X className="w-4 h-4 text-[#6B7280]" />
                </button>
              </div>
              <div className="flex items-center justify-center">
                {(state.phase === "planning" || state.phase === "questions") && <LivePreview answers={state.answers} description={state.businessDescription} />}
                {state.phase === "generating" && (
                  <div className="text-center py-10">
                    <div className="w-10 h-10 border-2 border-[#E5E7EB] border-t-[#2D6A4F] rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-[#6B7280]">{state.reasoningSteps.find(s => s.status === "active")?.label || "Building..."}</p>
                  </div>
                )}
                {state.phase === "preview" && state.generatedData && (
                  <FunnelPreview data={state.generatedData} color={state.primaryColor} logoUrl={state.answers.logo_url} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
