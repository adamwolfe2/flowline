"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Target,
  BarChart3,
  Calendar,
  Link2,
  ArrowRight,
  MessageSquare,
  Bot,
  CheckCircle2,
  ChevronDown,
  Mail,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const tabs = [
  { id: "builder", label: "AI Builder", icon: Sparkles },
  { id: "scoring", label: "Lead Scoring", icon: Target },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "routing", label: "Calendar Routing", icon: Calendar },
  { id: "integrations", label: "Integrations", icon: Link2 },
] as const;

type TabId = (typeof tabs)[number]["id"];

/* ------------------------------------------------------------------ */
/*  Left-side content data                                             */
/* ------------------------------------------------------------------ */

interface TabContent {
  headline: string;
  bullets: { icon: React.ElementType; text: string }[];
  cta: string;
}

const leftContent: Record<TabId, TabContent> = {
  builder: {
    headline: "Build qualifying funnels with AI",
    bullets: [
      { icon: MessageSquare, text: "Describe your business in one sentence" },
      { icon: Bot, text: "AI writes your headline, questions, and scoring" },
      { icon: Sparkles, text: "Live in under 60 seconds \u2014 no code needed" },
    ],
    cta: "Try the AI builder",
  },
  scoring: {
    headline: "Score every lead automatically",
    bullets: [
      { icon: Target, text: "Assign point values to every answer" },
      { icon: BarChart3, text: "Leads are scored and tiered in real time" },
      {
        icon: Calendar,
        text: "Hot leads book premium slots, cold leads get filtered",
      },
    ],
    cta: "See how scoring works",
  },
  analytics: {
    headline: "Know exactly where leads drop off",
    bullets: [
      { icon: BarChart3, text: "Step-by-step drop-off waterfall chart" },
      { icon: Target, text: "See which questions cause the most friction" },
      { icon: Link2, text: "UTM attribution \u2014 know your best traffic source" },
    ],
    cta: "View sample analytics",
  },
  routing: {
    headline: "Route leads to the right calendar",
    bullets: [
      { icon: CheckCircle2, text: "High scorers book your premium discovery call" },
      { icon: Calendar, text: "Mid scorers get an intro call with your SDR" },
      { icon: Mail, text: "Low scorers receive a nurture sequence" },
    ],
    cta: "Set up routing",
  },
  integrations: {
    headline: "Connect to your existing stack",
    bullets: [
      { icon: Calendar, text: "Works with Cal.com, Calendly, and Google Calendar" },
      { icon: Link2, text: "Send leads to Zapier, Make, or any webhook" },
      { icon: Sparkles, text: "Embed on any website with a single link" },
    ],
    cta: "Explore integrations",
  },
};

/* ------------------------------------------------------------------ */
/*  Left content renderer                                              */
/* ------------------------------------------------------------------ */

function LeftContent({ tab }: { tab: TabId }) {
  const data = leftContent[tab];
  return (
    <>
      <h2
        className="text-2xl md:text-3xl font-bold text-[#111827] mb-6"
        style={{ fontFamily: "var(--font-lora)" }}
      >
        {data.headline}
      </h2>
      <div className="space-y-4 mb-8">
        {data.bullets.map((bullet, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#2D6A4F]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <bullet.icon className="w-3.5 h-3.5 text-[#2D6A4F]" />
            </div>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              {bullet.text}
            </p>
          </div>
        ))}
      </div>
      <Link
        href="/onboarding"
        className="inline-flex items-center gap-2 bg-[#2D6A4F] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#245840] transition-colors"
      >
        {data.cta} <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  RIGHT-SIDE MOCKUPS                                                 */
/* ------------------------------------------------------------------ */

/* --- AI Builder Mockup --- */

function BuilderMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1800),
      setTimeout(() => setStep(3), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const questions = [
    "What is your monthly revenue?",
    "How large is your team?",
    "What is your biggest challenge?",
  ];

  return (
    <div className="w-full max-w-[420px] grid grid-cols-2 gap-3 h-full">
      {/* Chat panel */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 flex flex-col gap-2 overflow-hidden">
        <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
          AI Chat
        </div>
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-[#2D6A4F]/10 rounded-lg p-2.5 text-xs text-[#111827] self-end"
            >
              I sell business coaching to entrepreneurs
            </motion.div>
          )}
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2.5 text-xs text-[#111827] flex items-start gap-1.5"
            >
              <Bot className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
              <span>Built &mdash; 3 qualifying questions created</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview panel */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 flex flex-col gap-2 overflow-hidden">
        <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
          Live Preview
        </div>
        <AnimatePresence>
          {step >= 3 &&
            questions.map((q, i) => (
              <motion.div
                key={q}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.15 }}
                className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 text-[11px] text-[#111827] font-medium"
              >
                {q}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* --- Lead Scoring Mockup --- */

function ScoringMockup() {
  const [visible, setVisible] = useState(0);
  const cards = [
    { q: "What is your monthly revenue?", pts: 20 },
    { q: "How large is your team?", pts: 15 },
    { q: "What is your biggest challenge?", pts: 25 },
  ];

  useEffect(() => {
    setVisible(0);
    const timers = [
      setTimeout(() => setVisible(1), 400),
      setTimeout(() => setVisible(2), 1000),
      setTimeout(() => setVisible(3), 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const totalScore = cards
    .slice(0, visible)
    .reduce((sum, c) => sum + c.pts, 0);

  return (
    <div className="w-full max-w-[360px] space-y-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.q}
          initial={{ opacity: 0, x: -16 }}
          animate={
            i < visible
              ? { opacity: 1, x: 0 }
              : { opacity: 0, x: -16 }
          }
          transition={{ duration: 0.35 }}
          className="bg-white rounded-xl border border-[#E5E7EB] p-3 flex items-center justify-between"
        >
          <span className="text-xs text-[#111827] font-medium">{card.q}</span>
          <span className="text-xs font-bold text-[#2D6A4F] bg-[#2D6A4F]/10 rounded-full px-2.5 py-1">
            +{card.pts}
          </span>
        </motion.div>
      ))}

      {/* Score total */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={
          visible === 3
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.9 }
        }
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-[#2D6A4F] rounded-xl p-4 flex items-center justify-between"
      >
        <div>
          <div className="text-[10px] text-white/70 uppercase tracking-wider font-medium">
            Total Score
          </div>
          <div className="text-2xl font-bold text-white">
            {totalScore}
          </div>
        </div>
        <div className="bg-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-300" />
          Hot Lead
        </div>
      </motion.div>

      {/* Arrow to calendar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={visible === 3 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="flex items-center justify-center gap-2 text-xs text-[#6B7280]"
      >
        <ChevronDown className="w-3.5 h-3.5" />
        <span>Routes to Discovery Call</span>
        <Calendar className="w-3.5 h-3.5 text-[#2D6A4F]" />
      </motion.div>
    </div>
  );
}

/* --- Analytics Mockup --- */

function AnalyticsMockup() {
  const [animate, setAnimate] = useState(false);
  const steps = [
    { label: "Welcome", value: 1000 },
    { label: "Q1", value: 850 },
    { label: "Q2", value: 720 },
    { label: "Q3", value: 680 },
    { label: "Email", value: 540 },
    { label: "Booked", value: 380 },
  ];
  const maxVal = steps[0].value;

  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full max-w-[400px]">
      <div className="flex items-end gap-2 h-[240px]">
        {steps.map((step, i) => {
          const heightPct = (step.value / maxVal) * 100;
          const dropPct =
            i > 0
              ? Math.round(
                  ((steps[i - 1].value - step.value) / steps[i - 1].value) *
                    100
                )
              : 0;

          return (
            <div
              key={step.label}
              className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
            >
              {/* Drop-off label */}
              {i > 0 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={animate ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.4 + i * 0.15, duration: 0.3 }}
                  className="text-[9px] font-semibold text-red-500 -mb-0.5"
                >
                  -{dropPct}%
                </motion.span>
              )}

              {/* Value label */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={animate ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.3 }}
                className="text-[10px] font-bold text-[#111827]"
              >
                {step.value.toLocaleString()}
              </motion.span>

              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={
                  animate ? { height: `${heightPct}%` } : { height: 0 }
                }
                transition={{
                  delay: 0.1 + i * 0.12,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                className="w-full rounded-t-lg bg-[#2D6A4F]"
                style={{ minHeight: 0 }}
              />

              {/* Label */}
              <span className="text-[9px] text-[#6B7280] font-medium mt-1 truncate w-full text-center">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- Routing Mockup --- */

function RoutingMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const routes = [
    {
      color: "border-emerald-400 bg-emerald-50",
      badge: "bg-emerald-100 text-emerald-700",
      label: "Score 70+",
      dest: "Discovery Call with Senior AE",
      destIcon: Calendar,
    },
    {
      color: "border-amber-400 bg-amber-50",
      badge: "bg-amber-100 text-amber-700",
      label: "Score 40\u201369",
      dest: "Intro Call with SDR",
      destIcon: Calendar,
    },
    {
      color: "border-gray-300 bg-gray-50",
      badge: "bg-gray-100 text-gray-600",
      label: "Score < 40",
      dest: "Nurture Email Sequence",
      destIcon: Mail,
    },
  ];

  return (
    <div className="w-full max-w-[360px] space-y-3">
      {/* Top box */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-[#E5E7EB] rounded-xl p-3 text-center text-xs font-semibold text-[#111827]"
      >
        Lead Submits Quiz
      </motion.div>

      {/* Score box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={step >= 1 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-center"
      >
        <div className="bg-[#2D6A4F] text-white rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-2">
          <Target className="w-3.5 h-3.5" />
          AI Scores: 72 points
        </div>
      </motion.div>

      {/* Vertical connector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={step >= 2 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-center"
      >
        <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
      </motion.div>

      {/* Three routes */}
      <div className="space-y-2">
        {routes.map((route, i) => (
          <motion.div
            key={route.label}
            initial={{ opacity: 0, x: -12 }}
            animate={
              step >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }
            }
            transition={{ duration: 0.3, delay: i * 0.12 }}
            className={`rounded-xl border p-3 flex items-center justify-between ${route.color} ${
              i === 0 && step >= 3 ? "ring-2 ring-emerald-400/50" : ""
            }`}
          >
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${route.badge}`}
            >
              {route.label}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-[#111827] font-medium">
              <route.destIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{route.dest}</span>
              <span className="sm:hidden">
                {route.dest.split(" ").slice(0, 2).join(" ")}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* --- Integrations Mockup --- */

function IntegrationsMockup() {
  const rows = [
    {
      category: "Calendar",
      items: [
        { name: "Cal.com", color: "text-[#111827]" },
        { name: "Calendly", color: "text-[#006BFF]" },
      ],
    },
    {
      category: "Automation",
      items: [
        { name: "Zapier", color: "text-[#FF4A00]" },
        { name: "Make", color: "text-[#6D00CC]" },
      ],
    },
    {
      category: "CRM",
      items: [
        { name: "HubSpot", color: "text-[#FF7A59]" },
        { name: "Salesforce", color: "text-[#00A1E0]" },
      ],
    },
  ];

  return (
    <div className="w-full max-w-[360px] space-y-5 relative">
      {/* Center logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center mb-2"
      >
        <div className="bg-[#2D6A4F] text-white text-xs font-bold rounded-xl px-4 py-2">
          MyVSL
        </div>
      </motion.div>

      {/* Integration rows */}
      {rows.map((row, ri) => (
        <motion.div
          key={row.category}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 + ri * 0.15 }}
        >
          <div className="text-[9px] uppercase tracking-wider text-[#9CA3AF] font-semibold mb-1.5">
            {row.category}
          </div>
          <div className="flex gap-2">
            {row.items.map((item) => (
              <div
                key={item.name}
                className="flex-1 bg-white border border-[#E5E7EB] rounded-xl p-3 flex items-center justify-center"
              >
                <span className={`text-sm font-semibold ${item.color}`}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Animated connecting lines (simplified as dots) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute inset-0 pointer-events-none flex items-start justify-center"
      >
        <svg
          className="w-full h-full absolute top-0 left-0"
          style={{ zIndex: 0 }}
        >
          <motion.line
            x1="50%"
            y1="36"
            x2="50%"
            y2="100%"
            stroke="#2D6A4F"
            strokeWidth="1"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.15 }}
            transition={{ delay: 0.6, duration: 1 }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mockup selector                                                    */
/* ------------------------------------------------------------------ */

function RightMockup({ tab }: { tab: TabId }) {
  switch (tab) {
    case "builder":
      return <BuilderMockup />;
    case "scoring":
      return <ScoringMockup />;
    case "analytics":
      return <AnalyticsMockup />;
    case "routing":
      return <RoutingMockup />;
    case "integrations":
      return <IntegrationsMockup />;
  }
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function ProductDemo() {
  const [activeTab, setActiveTab] = useState<TabId>("builder");

  return (
    <section id="demo" className="bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Tab bar */}
        <div className="flex items-center justify-center gap-1 mb-12 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#2D6A4F] text-white shadow-sm"
                  : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden min-h-[480px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid md:grid-cols-2 min-h-[480px]"
            >
              {/* LEFT: Copy */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <LeftContent tab={activeTab} />
              </div>
              {/* RIGHT: Interactive mockup */}
              <div className="bg-[#F9FAFB] p-6 md:p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-[#E5E7EB]">
                <RightMockup tab={activeTab} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
