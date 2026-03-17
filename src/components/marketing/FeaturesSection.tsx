"use client";

import { motion } from "framer-motion";
import { Sparkles, Globe, Shield } from "lucide-react";


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

function AIGenerationMockup() {
  const cards = [
    { q: "What is your monthly revenue?", delay: 0 },
    { q: "How large is your team?", delay: 0.2 },
    { q: "What is your biggest challenge?", delay: 0.4 },
  ];

  return (
    <div className="bg-[#F9FAFB] p-6 md:p-8 flex items-center justify-center min-h-[200px]">
      <div className="space-y-3 w-full max-w-[320px]">
        {cards.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 + item.delay }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-3.5 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
            </div>
            <div>
              <p className="text-xs text-[#111827] font-medium">{item.q}</p>
              <p className="text-[10px] text-[#A3A3A3]">AI generated</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ScoringChipsMockup() {
  const chips = [
    {
      label: "Revenue",
      pts: "+20",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Timeline",
      pts: "+15",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Budget",
      pts: "+25",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Team Size",
      pts: "+10",
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      label: "Industry",
      pts: "+15",
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      label: "Urgency",
      pts: "+20",
      color: "bg-orange-50 text-orange-700 border-orange-200",
    },
  ];

  return (
    <div className="bg-[#F9FAFB] p-6 md:p-8 flex items-center justify-center min-h-[200px]">
      <div className="flex flex-wrap gap-2 justify-center max-w-[300px]">
        {chips.map((chip, i) => (
          <motion.div
            key={chip.label}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border ${chip.color}`}
          >
            {chip.label}
            <span className="opacity-60">{chip.pts}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CalendarIntegrationMockup() {
  return (
    <div className="bg-[#F9FAFB] p-6 md:p-8 flex items-center justify-center min-h-[200px]">
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="bg-white rounded-full border border-[#E5E7EB] px-5 py-2.5 flex items-center gap-2"
        >
          <span className="text-sm font-semibold text-[#111827]">Cal.com</span>
        </motion.div>
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.25 }}
          className="text-[#9CA3AF] text-lg font-light"
        >
          +
        </motion.span>
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="bg-white rounded-full border border-[#E5E7EB] px-5 py-2.5 flex items-center gap-2"
        >
          <span className="text-sm font-semibold text-[#006BFF]">
            Calendly
          </span>
        </motion.div>
      </div>
    </div>
  );
}

function DomainMockup() {
  return (
    <div className="bg-[#F9FAFB] p-6 md:p-8 flex items-center justify-center min-h-[200px]">
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 w-full max-w-[240px]">
        <div className="flex items-center justify-between mb-3">
          <Globe className="w-4 h-4 text-[#A3A3A3]" />
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-emerald-600 font-medium">
              Active
            </span>
          </div>
        </div>
        <p className="text-sm font-medium text-[#111827]">quiz.acme.com</p>
        <p className="text-[10px] text-[#A3A3A3] mt-1">SSL secured</p>
      </div>
    </div>
  );
}

function EnterpriseMockup() {
  return (
    <div className="bg-[#F9FAFB] p-6 md:p-8 flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full border-2 border-[#E5E7EB] flex items-center justify-center bg-white">
          <Shield className="w-7 h-7 text-[#111827]" />
        </div>
        <span className="text-xs font-semibold text-[#111827]">
          Enterprise Ready
        </span>
        <span className="text-[10px] text-[#A3A3A3]">SOC 2 Compliant</span>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section className="bg-white border-t border-[#E5E7EB] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <SectionLabel icon={<Sparkles className="w-3.5 h-3.5" />}>
            Features
          </SectionLabel>
          <h2
            className="text-[32px] sm:text-[40px] font-semibold text-[#111827] leading-tight"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            Your funnel, fully built
          </h2>
          <p className="text-[#6B7280] max-w-xl">
            Tell us what you sell. We handle the questions, scoring, and calendar routing. You just share the link.
          </p>
        </div>

        {/* Top row: 2 wide cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {[
            {
              title: "AI-powered quiz generation",
              description:
                "Describe your business and AI creates qualifying questions, answer options, and scoring rules in seconds.",
              illustration: <AIGenerationMockup />,
            },
            {
              title: "Smart scoring engine",
              description:
                "Assign point values to every answer. Leads are scored automatically and routed to the right calendar.",
              illustration: <ScoringChipsMockup />,
            },
          ].map((card, i) => (
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
                <h3 className="text-xl font-semibold text-[#111827] mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-[#6B7280]">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom row: 3 narrow cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Calendar integrations",
              description:
                "Connect Cal.com, Calendly, or Google Calendar. Leads book directly after qualifying.",
              illustration: <CalendarIntegrationMockup />,
            },
            {
              title: "Custom domains",
              description:
                "Publish your funnel on your own domain with automatic SSL. Looks like your brand, not ours.",
              illustration: <DomainMockup />,
            },
            {
              title: "Enterprise ready",
              description:
                "SOC 2 compliant infrastructure, team permissions, audit logs, and SSO ready.",
              illustration: <EnterpriseMockup />,
            },
          ].map((card, i) => (
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
                <h3 className="text-xl font-semibold text-[#111827] mb-2">
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
