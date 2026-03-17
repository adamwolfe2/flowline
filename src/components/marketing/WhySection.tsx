"use client";

import { motion } from "framer-motion";
import { BarChart3, GitBranch, Calendar } from "lucide-react";

function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 border border-black/10 bg-white rounded-full px-3 py-1 text-sm font-medium text-[#333333]">
      {icon}
      {children}
    </div>
  );
}

function WaterfallChart() {
  const bars = [
    { label: "Visitors", pct: 100, color: "#D4D4D4" },
    { label: "Started", pct: 78, color: "#2D6A4F" },
    { label: "Completed", pct: 56, color: "#2D6A4F" },
    { label: "Qualified", pct: 38, color: "#E8A820" },
    { label: "Booked", pct: 28, color: "#2D6A4F" },
  ];

  return (
    <div className="bg-[#FBFBFB] p-6 md:p-8 flex items-end justify-center gap-3 min-h-[200px]">
      {bars.map((bar) => (
        <div key={bar.label} className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-medium text-[#A3A3A3]">
            {bar.pct}%
          </span>
          <div
            className="w-10 rounded-t-md transition-all"
            style={{
              height: `${bar.pct * 1.4}px`,
              backgroundColor: bar.color,
            }}
          />
          <span className="text-[10px] text-[#737373]">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

function ScoringDiagram() {
  return (
    <div className="bg-[#FBFBFB] p-6 md:p-8 flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3 w-full max-w-[280px]">
        {/* AI Action */}
        <div className="bg-[#333333] text-white text-xs font-medium px-4 py-2 rounded-lg w-full text-center">
          AI Scores Lead
        </div>
        <div className="h-4 w-px bg-[#D4D4D4]" />
        {/* Branch */}
        <div className="bg-[#2D6A4F] text-white text-xs font-semibold px-4 py-2 rounded-lg w-full text-center">
          Branch by Score
        </div>
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="h-4 w-px bg-[#D4D4D4]" />
            <div className="bg-emerald-100 text-emerald-700 text-[10px] font-medium px-3 py-1.5 rounded-md text-center">
              80+ Hot
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="h-4 w-px bg-[#D4D4D4]" />
            <div className="bg-amber-100 text-amber-700 text-[10px] font-medium px-3 py-1.5 rounded-md text-center">
              50-79 Warm
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="h-4 w-px bg-[#D4D4D4]" />
            <div className="bg-gray-100 text-gray-600 text-[10px] font-medium px-3 py-1.5 rounded-md text-center">
              0-49 Nurture
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarTable() {
  const rows = [
    {
      tier: "Hot Lead",
      calendar: "Senior AE",
      badge: "bg-emerald-100 text-emerald-700",
    },
    {
      tier: "Warm Lead",
      calendar: "SDR Team",
      badge: "bg-amber-100 text-amber-700",
    },
    {
      tier: "Intro Call",
      calendar: "Auto-book",
      badge: "bg-blue-100 text-blue-700",
    },
  ];

  return (
    <div className="bg-[#FBFBFB] p-6 md:p-8 flex items-center justify-center min-h-[200px]">
      <div className="w-full max-w-[280px] bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#EBEBEB] bg-[#FBFBFB]">
          <span className="text-[10px] font-semibold text-[#A3A3A3] uppercase tracking-wider">
            Calendar Routing
          </span>
        </div>
        {rows.map((row) => (
          <div
            key={row.tier}
            className="flex items-center justify-between px-4 py-2.5 border-b border-[#EBEBEB] last:border-0"
          >
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded ${row.badge}`}
            >
              {row.tier}
            </span>
            <span className="text-xs text-[#737373]">{row.calendar}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WhySection() {
  const cards = [
    {
      title: "See where leads drop off",
      description:
        "Real-time waterfall analytics show exactly where prospects lose interest, so you can optimize every step.",
      illustration: <WaterfallChart />,
    },
    {
      title: "Route leads by score",
      description:
        "AI scores every response automatically and routes high-intent leads to your best closers.",
      illustration: <ScoringDiagram />,
    },
    {
      title: "Control your calendar routing",
      description:
        "Assign different calendars based on lead quality. Hot leads meet your AE, warm leads meet your SDR.",
      illustration: <CalendarTable />,
    },
  ];

  return (
    <section className="border-t border-[#F0F0F0] bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <SectionLabel icon={<BarChart3 className="w-3.5 h-3.5" />}>
            Why Qualifi?
          </SectionLabel>
          <h2
            className="text-[32px] sm:text-[40px] font-semibold text-[#333333] leading-tight"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Build and deploy with confidence
          </h2>
          <p className="text-[#737373] max-w-xl">
            AI builds your funnel. You control who sees it, how leads are scored,
            and where they book.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {card.illustration}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#333333] mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-[#737373]">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
