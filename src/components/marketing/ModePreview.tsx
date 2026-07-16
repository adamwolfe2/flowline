"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutTemplate,
  ListChecks,
  Play,
  Target,
  ArrowRight,
  Image as ImageIcon,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  One builder, two funnel types — each with a small gallery of       */
/*  real template examples a prospect can preview before building.     */
/*  Mirrors ProductDemo's visual language (browser chrome, frosted     */
/*  segmented control, #0A9AFF brand, Instrument Sans).                */
/* ------------------------------------------------------------------ */

type Mode = "landing" | "quiz";
type FormField = "name" | "email";

interface LandingTemplate {
  id: string;
  name: string;
  tagline: string;
  logo: boolean;
  headline: string;
  sub: string;
  media: "video" | "image";
  mediaLabel: string;
  fields: FormField[];
  cta: string;
}

interface QuizOption {
  text: string;
  selected?: boolean;
  pts?: number;
}

interface QuizTemplate {
  id: string;
  name: string;
  tagline: string;
  progress: number;
  stepLabel: string;
  question: string;
  options: QuizOption[];
  routeLabel: string;
}

const LANDING_TEMPLATES: LandingTemplate[] = [
  {
    id: "coaching-vsl",
    name: "Coaching VSL",
    tagline: "Video sales letter → booked call",
    logo: true,
    headline: "Watch How We 3× Your Booked Calls",
    sub: "A 4-minute breakdown for coaches and agencies",
    media: "video",
    mediaLabel: "4:12",
    fields: ["name", "email"],
    cta: "Book Your Call",
  },
  {
    id: "webinar",
    name: "Webinar Registration",
    tagline: "Drive sign-ups to a live or evergreen session",
    logo: false,
    headline: "Free Masterclass: Scale to $50K / Month",
    sub: "Live Thursday at 2pm ET — seats are limited",
    media: "image",
    mediaLabel: "Thu, 2:00pm ET",
    fields: ["name", "email"],
    cta: "Save My Seat",
  },
  {
    id: "lead-magnet",
    name: "Lead Magnet",
    tagline: "Trade a guide for an email",
    logo: false,
    headline: "The 7-Figure Outbound Playbook",
    sub: "37 pages. Steal our exact system — free.",
    media: "image",
    mediaLabel: "PDF · 37 pages",
    fields: ["email"],
    cta: "Send Me The Guide",
  },
];

const QUIZ_TEMPLATES: QuizTemplate[] = [
  {
    id: "revenue",
    name: "Revenue Qualifier",
    tagline: "Score by budget, route to the right call",
    progress: 66,
    stepLabel: "Question 2 of 3",
    question: "What is your monthly revenue?",
    options: [
      { text: "Under $10K / month" },
      { text: "$10K – $50K / month", selected: true, pts: 25 },
      { text: "$50K+ / month" },
    ],
    routeLabel: "Score 45 — routing to Discovery Call",
  },
  {
    id: "fitness",
    name: "Fitness Assessment",
    tagline: "Qualify by goal and commitment",
    progress: 25,
    stepLabel: "Question 1 of 4",
    question: "What is your primary goal?",
    options: [
      { text: "Lose weight", selected: true, pts: 15 },
      { text: "Build muscle" },
      { text: "General health" },
    ],
    routeLabel: "Building your custom plan…",
  },
  {
    id: "b2b",
    name: "B2B Fit Finder",
    tagline: "Filter by team size and use case",
    progress: 50,
    stepLabel: "Question 2 of 4",
    question: "How big is your team?",
    options: [
      { text: "1 – 10 people" },
      { text: "11 – 50 people", selected: true, pts: 20 },
      { text: "51+ people" },
    ],
    routeLabel: "Score 60 — routing to Demo Call",
  },
];

const MODES = [
  { id: "landing" as const, label: "Landing Page", icon: LayoutTemplate, sub: "Single scroll-stopping page" },
  { id: "quiz" as const, label: "Quiz Funnel", icon: ListChecks, sub: "Guided, scored, multi-step" },
];

/* --- Landing template preview --- */

function LandingTemplatePreview({ t }: { t: LandingTemplate }) {
  return (
    <div className="w-full max-w-[340px] space-y-3">
      <div className="text-center space-y-1.5">
        {t.logo && (
          <div className="w-9 h-9 rounded-lg bg-[#0A9AFF]/10 mx-auto flex items-center justify-center">
            <div className="w-4 h-4 rounded bg-[#0A9AFF]" />
          </div>
        )}
        <div className="text-[13px] font-bold text-[#0A0A0A] leading-tight">{t.headline}</div>
        <div className="text-[10px] text-[#6B7280]">{t.sub}</div>
      </div>

      {t.media === "video" ? (
        <div className="relative aspect-video w-full rounded-xl bg-[#111827] overflow-hidden flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="w-4 h-4 text-[#0A9AFF] fill-[#0A9AFF] ml-0.5" />
          </div>
          <span className="absolute bottom-1.5 right-2 text-[8px] font-mono text-white/60">
            {t.mediaLabel}
          </span>
        </div>
      ) : (
        <div className="relative aspect-video w-full rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] overflow-hidden flex flex-col items-center justify-center gap-1.5">
          {t.id === "webinar" ? (
            <CalendarDays className="w-6 h-6 text-[#0A9AFF]" />
          ) : (
            <ImageIcon className="w-6 h-6 text-[#9CA3AF]" />
          )}
          <span className="text-[9px] font-medium text-[#6B7280]">{t.mediaLabel}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 space-y-2">
        {t.fields.includes("name") && (
          <div className="h-7 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] flex items-center px-2.5">
            <span className="text-[10px] text-[#9CA3AF]">Your name</span>
          </div>
        )}
        {t.fields.includes("email") && (
          <div className="h-7 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] flex items-center px-2.5">
            <span className="text-[10px] text-[#9CA3AF]">you@company.com</span>
          </div>
        )}
        <div className="h-8 rounded-lg bg-[#0A9AFF] flex items-center justify-center">
          <span className="text-[11px] font-semibold text-white">{t.cta}</span>
        </div>
      </div>
    </div>
  );
}

/* --- Quiz template preview --- */

function QuizTemplatePreview({ t }: { t: QuizTemplate }) {
  return (
    <div className="w-full max-w-[340px] space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[9px] font-medium text-[#6B7280]">
          <span>{t.stepLabel}</span>
          <span>{t.progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
          <motion.div
            key={t.id}
            className="h-full rounded-full bg-[#0A9AFF]"
            initial={{ width: 0 }}
            animate={{ width: `${t.progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-3.5 space-y-2.5">
        <div className="text-[13px] font-bold text-[#0A0A0A] leading-tight">{t.question}</div>
        <div className="space-y-1.5">
          {t.options.map((opt) => (
            <div
              key={opt.text}
              className={`flex items-center justify-between rounded-lg border px-2.5 py-2 text-[11px] font-medium transition-colors ${
                opt.selected
                  ? "border-[#0A9AFF] bg-[#0A9AFF]/5 text-[#0A9AFF]"
                  : "border-[#E5E7EB] text-[#6B7280]"
              }`}
            >
              <span>{opt.text}</span>
              {opt.selected && opt.pts != null && (
                <span className="text-[9px] font-bold text-[#0A9AFF] bg-[#0A9AFF]/10 rounded-full px-2 py-0.5">
                  +{opt.pts} pts
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#6B7280]">
          <Target className="w-3 h-3 text-[#0A9AFF]" />
          <span>{t.routeLabel}</span>
        </div>
        <div className="h-7 rounded-lg bg-[#0A9AFF] flex items-center gap-1 px-3">
          <span className="text-[10px] font-semibold text-white">Next</span>
          <ArrowRight className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  );
}

/* --- Template gallery card (left column) --- */

function TemplateCard({
  name,
  tagline,
  active,
  onClick,
}: {
  name: string;
  tagline: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`w-full text-left rounded-xl border p-3 transition-colors ${
        active
          ? "border-[#0A9AFF] bg-[#0A9AFF]/5 ring-1 ring-[#0A9AFF]/30"
          : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[13px] font-semibold ${active ? "text-[#0A9AFF]" : "text-[#0A0A0A]"}`}
        >
          {name}
        </span>
        {active && <ArrowRight className="w-3.5 h-3.5 text-[#0A9AFF] flex-shrink-0" />}
      </div>
      <p className="text-[11px] text-[#6B7280] mt-0.5 leading-snug">{tagline}</p>
    </button>
  );
}

export function ModePreview() {
  const [mode, setMode] = useState<Mode>("landing");
  const [landingId, setLandingId] = useState(LANDING_TEMPLATES[0].id);
  const [quizId, setQuizId] = useState(QUIZ_TEMPLATES[0].id);

  const landingTemplate = useMemo(
    () => LANDING_TEMPLATES.find((t) => t.id === landingId) ?? LANDING_TEMPLATES[0],
    [landingId]
  );
  const quizTemplate = useMemo(
    () => QUIZ_TEMPLATES.find((t) => t.id === quizId) ?? QUIZ_TEMPLATES[0],
    [quizId]
  );

  const templates = mode === "landing" ? LANDING_TEMPLATES : QUIZ_TEMPLATES;
  const activeId = mode === "landing" ? landingId : quizId;
  const setActiveId = mode === "landing" ? setLandingId : setQuizId;
  const previewKey = `${mode}-${activeId}`;

  return (
    <section
      id="funnel-types"
      className="bg-white py-20 sm:py-28 px-4 sm:px-6"
      style={{ fontFamily: "var(--font-instrument-sans)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#0A0A0A] tracking-[-0.03em] mb-4">
            One builder. Two funnel types.
          </h2>
          <p className="text-lg text-[#6B7280] max-w-xl mx-auto">
            Preview a real template before you build. Guide prospects through a scored quiz, or
            send them to a single high-converting landing page.
          </p>
        </div>

        {/* Segmented toggle */}
        <div className="flex justify-center mb-8">
          <div
            role="tablist"
            aria-label="Funnel type"
            className="inline-flex items-center gap-0.5 bg-white/80 backdrop-blur-sm rounded-[14px] p-1.5 ring-1 ring-black/[0.06] shadow-sm"
          >
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMode(m.id)}
                  className={`relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                    active ? "text-white" : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="modePill"
                      className="absolute inset-0 rounded-[10px] bg-[#0A0A0A] shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <m.icon className={`relative w-4 h-4 ${active ? "text-[#7CC8FB]" : ""}`} />
                  <span className="relative">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Browser chrome wrapper */}
        <div className="bg-white ring-1 ring-black/[0.06] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-[0_24px_70px_-24px_rgba(6,60,110,0.25)]">
          {/* Browser bar */}
          <div className="h-10 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center px-4 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            <div className="flex-1 mx-4 sm:mx-8">
              <div className="bg-white border border-[#E5E7EB] rounded px-3 py-1 text-[10px] text-[#9CA3AF] text-center max-w-[240px] mx-auto truncate">
                yourbrand.com/{activeId}
              </div>
            </div>
          </div>

          {/* Content: template gallery (left) + live preview (right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[380px] sm:min-h-[440px]">
            {/* LEFT: gallery */}
            <div className="p-5 sm:p-7 md:p-9 flex flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">
                {mode === "landing" ? "Landing page templates" : "Quiz funnel templates"}
              </p>
              <div className="space-y-2.5">
                {templates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    name={t.name}
                    tagline={t.tagline}
                    active={activeId === t.id}
                    onClick={() => setActiveId(t.id)}
                  />
                ))}
              </div>
              <Link
                href={`/build?type=${mode}&template=${activeId}`}
                className="mt-6 inline-flex items-center gap-1.5 sm:gap-2 bg-[#0A0A0A] text-white text-[13px] sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-[10px] hover:bg-[#232323] transition-colors self-start"
              >
                Start with this template <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </Link>
            </div>

            {/* RIGHT: live preview of the selected template */}
            <div className="bg-[#F9FAFB] p-5 sm:p-6 md:p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-[#E5E7EB]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={previewKey}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="w-full flex justify-center"
                >
                  {mode === "landing" ? (
                    <LandingTemplatePreview t={landingTemplate} />
                  ) : (
                    <QuizTemplatePreview t={quizTemplate} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
