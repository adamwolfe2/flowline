"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";


function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 border border-[#E5E7EB] bg-white rounded-full px-3 py-1 text-sm font-medium text-[#111827]">
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
    { label: "Qualified", pct: 38, color: "#2D6A4F" },
    { label: "Booked", pct: 28, color: "#2D6A4F" },
  ];

  return (
    <div className="bg-[#F9FAFB] p-6 md:p-8 flex items-end justify-center gap-3 min-h-[200px]">
      {bars.map((bar, i) => (
        <div key={bar.label} className="flex flex-col items-center gap-2">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.3 }}
            className="text-[10px] font-medium text-[#A3A3A3]"
          >
            {bar.pct}%
          </motion.span>
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: bar.pct * 1.4 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.15 + i * 0.12,
              duration: 0.5,
              ease: "easeOut",
            }}
            className="w-10 rounded-t-md"
            style={{ backgroundColor: bar.color }}
          />
          <span className="text-[10px] text-[#6B7280]">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

function ScoringDiagram() {
  return (
    <div className="bg-[#F9FAFB] p-6 md:p-8 flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3 w-full max-w-[280px]">
        {/* AI Action */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-[#2D6A4F] text-white text-xs font-medium px-4 py-2 rounded-lg w-full text-center"
        >
          AI Scores Lead
        </motion.div>

        {/* Connector line grows */}
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.3 }}
          style={{ transformOrigin: "top" }}
          className="h-4 w-px bg-[#D4D4D4]"
        />

        {/* Branch */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.65, duration: 0.35 }}
          className="bg-[#2D6A4F] text-white text-xs font-semibold px-4 py-2 rounded-lg w-full text-center"
        >
          Branch by Score
        </motion.div>

        {/* Three tier boxes fan out */}
        <div className="flex items-start justify-between w-full">
          {[
            {
              label: "80+ Hot",
              cls: "bg-emerald-100 text-emerald-700",
            },
            {
              label: "50-79 Warm",
              cls: "bg-amber-100 text-amber-700",
            },
            {
              label: "0-49 Nurture",
              cls: "bg-gray-100 text-gray-600",
            },
          ].map((tier, i) => (
            <motion.div
              key={tier.label}
              initial={{ opacity: 0, y: -8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 + i * 0.12, duration: 0.35 }}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.85 + i * 0.12, duration: 0.2 }}
                style={{ transformOrigin: "top" }}
                className="h-4 w-px bg-[#D4D4D4]"
              />
              <div
                className={`${tier.cls} text-[10px] font-medium px-3 py-1.5 rounded-md text-center`}
              >
                {tier.label}
              </div>
            </motion.div>
          ))}
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
    <div className="bg-[#F9FAFB] p-6 md:p-8 flex items-center justify-center min-h-[200px]">
      <div className="w-full max-w-[280px] bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <span className="text-[10px] font-semibold text-[#A3A3A3] uppercase tracking-wider">
            Calendar Routing
          </span>
        </div>
        {rows.map((row, i) => (
          <motion.div
            key={row.tier}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.35 }}
            className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E7EB] last:border-0"
          >
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded ${row.badge}`}
            >
              {row.tier}
            </span>
            <span className="text-xs text-[#6B7280]">{row.calendar}</span>
          </motion.div>
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
        "Hot leads book a sales call. Warm leads get a nurture sequence. Cold leads get filtered out automatically.",
      illustration: <CalendarTable />,
    },
  ];

  return (
    <section className="border-t border-[#E5E7EB] bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <SectionLabel icon={<BarChart3 className="w-3.5 h-3.5" />}>
            Why MyVSL?
          </SectionLabel>
          <h2
            className="text-[32px] sm:text-[40px] font-semibold text-[#111827] leading-tight"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Know exactly why leads don&apos;t book
          </h2>
          <p className="text-[#6B7280] max-w-xl">
            Every drop-off. Every answer. Every booking. All tracked automatically.
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
              className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {card.illustration}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#111827] mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-[#6B7280]">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
