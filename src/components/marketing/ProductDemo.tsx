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
  Globe,
  Code,
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
  { id: "emails", label: "Email Sequences", icon: Mail },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "publish", label: "Publish", icon: Globe },
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
      { icon: Sparkles, text: "Live in under 60 seconds. No code needed" },
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
      { icon: Link2, text: "UTM attribution so you know your best traffic source" },
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
  emails: {
    headline: "Automated follow-up sequences",
    bullets: [
      { icon: Mail, text: "Trigger email drips based on lead score tier" },
      { icon: CheckCircle2, text: "Customize subject, body, and delay per step" },
      { icon: Target, text: "Nurture cold leads while hot leads book instantly" },
    ],
    cta: "Set up sequences",
  },
  integrations: {
    headline: "Connect to your existing stack",
    bullets: [
      { icon: Calendar, text: "Embed Cal.com or Calendly booking pages directly" },
      { icon: Link2, text: "Send leads to Zapier, Make, n8n, or any webhook URL" },
      { icon: Sparkles, text: "Embed on any website with a single link" },
    ],
    cta: "Explore integrations",
  },
  publish: {
    headline: "Publish with your own domain",
    bullets: [
      { icon: Globe, text: "Connect any custom domain in seconds — no DNS expertise needed" },
      { icon: Code, text: "Embed on your site with a single script tag" },
      { icon: CheckCircle2, text: "SSL, CDN, and global edge delivery included free" },
    ],
    cta: "Try it free",
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
        className="text-sm sm:text-2xl md:text-3xl font-bold text-[#111827] mb-3 sm:mb-6"
        style={{ fontFamily: "var(--font-plus-jakarta)" }}
      >
        {data.headline}
      </h2>
      <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-8">
        {data.bullets.map((bullet, i) => (
          <div key={i} className="flex items-start gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#2D6A4F]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <bullet.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2D6A4F]" />
            </div>
            <p className="text-[11px] sm:text-sm text-[#6B7280] leading-relaxed">
              {bullet.text}
            </p>
          </div>
        ))}
      </div>
      <Link
        href="/build"
        className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#2D6A4F] text-white text-[11px] sm:text-sm font-medium px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-[#245840] transition-colors"
      >
        {data.cta} <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
    <div className="w-full max-w-[320px] sm:max-w-[420px] grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
      {/* Chat panel */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-3 flex flex-col gap-2 overflow-hidden">
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
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-3 flex flex-col gap-2 overflow-hidden">
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
          className="bg-white rounded-lg border border-[#E5E7EB] p-3 flex items-center justify-between"
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
        className="bg-[#2D6A4F] rounded-lg p-4 flex items-center justify-between"
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
    <div className="w-full max-w-[340px] sm:max-w-[400px]">
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
        className="bg-white border border-[#E5E7EB] rounded-lg p-3 text-center text-xs font-semibold text-[#111827]"
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
        <div className="bg-[#2D6A4F] text-white rounded-lg px-4 py-2.5 text-xs font-bold flex items-center gap-2">
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
            className={`rounded-lg border p-3 flex items-center justify-between ${route.color} ${
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
      category: "Direct",
      items: [
        { name: "Cal.com", logo: "/integrations/calcom.svg" },
        { name: "Calendly", logo: "/integrations/calendly.svg" },
      ],
    },
    {
      category: "Via Webhooks",
      items: [
        { name: "Zapier", logo: "/integrations/zapier.svg" },
        { name: "Make", logo: "/integrations/make.svg" },
      ],
    },
    {
      category: "Coming Soon",
      items: [
        { name: "HubSpot", logo: "/integrations/hubspot-svgrepo-com.svg" },
        { name: "Salesforce", logo: "/integrations/salesforce.svg" },
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
        <div className="bg-[#2D6A4F] text-white text-xs font-bold rounded-lg px-4 py-2">
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
                className="flex-1 bg-white border border-[#E5E7EB] rounded-lg p-3 flex items-center justify-center gap-2"
              >
                <img
                  src={item.logo}
                  alt={item.name}
                  className="w-6 h-6 object-contain"
                />
                <span className="text-xs font-medium text-[#6B7280]">
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

/* --- Publish / Custom Domain Mockup --- */

function PublishMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2000),
      setTimeout(() => setStep(4), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-[380px] space-y-4">
      {/* Domain input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl border border-[#E5E7EB] p-4"
      >
        <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Custom Domain</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2">
            <span className="text-sm font-mono text-[#111827]">
              {step >= 1 ? "form.yourbrand.com" : <span className="text-[#9CA3AF]">app.yourdomain.com</span>}
            </span>
          </div>
          <div className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${step >= 2 ? "bg-[#2D6A4F] text-white" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>
            {step >= 2 ? "Connected" : "Save"}
          </div>
        </div>
      </motion.div>

      {/* DNS setup */}
      {step >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-[#E5E7EB] p-4"
        >
          <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">DNS Record</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-[#F3F4F6] text-[#6B7280] font-mono px-1.5 py-0.5 rounded">CNAME</span>
              <span className="text-xs font-mono text-[#111827]">form.yourbrand.com</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-[#F3F4F6] text-[#6B7280] font-mono px-1.5 py-0.5 rounded">Value</span>
              <span className="text-xs font-mono text-[#111827]">cname.vercel-dns.com</span>
            </div>
          </div>
          {step >= 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 mt-3 text-xs text-[#2D6A4F] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              DNS verified
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Embed code */}
      {step >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-[#E5E7EB] p-4"
        >
          <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Embed Widget</p>
          <div className="bg-[#111827] rounded-lg p-3 font-mono text-[10px] text-[#86EFAC] overflow-x-auto">
            &lt;script src=&quot;getmyvsl.com/embed/...&quot;&gt;&lt;/script&gt;
          </div>
          <p className="text-[10px] text-[#9CA3AF] mt-2">Paste on any website to embed your quiz</p>
        </motion.div>
      )}

      {/* Live status */}
      {step >= 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#2D6A4F]/5 border border-[#2D6A4F]/20 rounded-xl p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D6A4F] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2D6A4F]" />
            </span>
            <span className="text-sm font-semibold text-[#2D6A4F]">Live at form.yourbrand.com</span>
          </div>
          <p className="text-[10px] text-[#6B7280]">SSL secured, globally distributed</p>
        </motion.div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mockup selector                                                    */
/* ------------------------------------------------------------------ */

function EmailsMockup() {
  const [step, setStep] = useState(0);
  const emails = [
    { delay: "Immediately", subject: "Thanks for your interest!", status: "Sent" },
    { delay: "After 24h", subject: "Quick question for you...", status: "Scheduled" },
    { delay: "After 72h", subject: "Last chance to book your call", status: "Scheduled" },
  ];

  useEffect(() => {
    setStep(0);
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1000),
      setTimeout(() => setStep(3), 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-[360px] space-y-3">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-[#E5E7EB] rounded-lg p-3 text-center"
      >
        <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold mb-1">Trigger</div>
        <div className="text-xs font-medium text-[#111827]">Lead submits quiz (Score &lt; 40)</div>
      </motion.div>
      {emails.map((email, i) => (
        <motion.div
          key={email.subject}
          initial={{ opacity: 0, y: 12 }}
          animate={i < step ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-[#E5E7EB] rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] text-[#9CA3AF] font-medium">{email.delay}</span>
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
              email.status === "Sent" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>{email.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
            <span className="text-xs font-medium text-[#111827]">{email.subject}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

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
    case "emails":
      return <EmailsMockup />;
    case "integrations":
      return <IntegrationsMockup />;
    case "publish":
      return <PublishMockup />;
  }
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function ProductDemo() {
  const [activeTab, setActiveTab] = useState<TabId>("builder");

  return (
    <section id="features" className="bg-[#FAFAFA] py-14 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#111827] mb-3" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
            Everything you need to convert
          </h2>
          <p className="text-base text-[#6B7280] max-w-lg mx-auto">
            From AI-powered funnel creation to automated follow-ups. Explore every feature.
          </p>
        </div>

        {/* Fillout-style frosted glass tab bar */}
        <div className="flex items-center justify-start sm:justify-center mb-10 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
          <div className="inline-flex items-center gap-0.5 bg-[#F3F4F6]/80 backdrop-blur-sm rounded-xl p-1.5 border border-[#E5E7EB]/60">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white text-[#111827] shadow-sm"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-[#2D6A4F]" : ""}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Browser chrome wrapper */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden shadow-sm">
          {/* Browser bar */}
          <div className="h-10 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center px-4 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" />
            <div className="flex-1 mx-4 sm:mx-8">
              <div className="bg-white border border-[#E5E7EB] rounded px-3 py-1 text-[10px] text-[#9CA3AF] text-center max-w-[220px] mx-auto">
                app.getmyvsl.com
              </div>
            </div>
          </div>

          {/* Content area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 min-h-[300px] sm:min-h-[360px] md:min-h-[460px]"
            >
              {/* LEFT: Copy */}
              <div className="p-3 sm:p-8 md:p-10 flex flex-col justify-center">
                <LeftContent tab={activeTab} />
              </div>
              {/* RIGHT: Interactive mockup */}
              <div className="bg-[#F9FAFB] p-3 sm:p-6 md:p-8 flex items-center justify-center border-l border-[#E5E7EB]">
                <RightMockup tab={activeTab} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
