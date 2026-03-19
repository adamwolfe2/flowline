"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  GitBranch,
  Mail,
  BarChart3,
  Users,
  Wand2,
} from "lucide-react";

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

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Builder",
    description:
      "Generate a complete funnel with AI in 60 seconds. Describe your business and get questions, scoring, and branding automatically.",
  },
  {
    icon: Target,
    title: "Smart Lead Scoring",
    description:
      "Score leads based on quiz answers and route them to the right calendar. High scorers book premium slots instantly.",
  },
  {
    icon: GitBranch,
    title: "A/B Testing",
    description:
      "Test different variants and optimize conversion. See which headlines, questions, and flows drive the most bookings.",
  },
  {
    icon: Mail,
    title: "Email Sequences",
    description:
      "Automated follow-up emails to nurture leads who don't book immediately. Drip campaigns that convert over time.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Track every step, see where leads drop off. Waterfall charts, UTM attribution, and conversion metrics in real time.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Invite team members and manage funnels together. Role-based permissions, shared templates, and team-wide analytics.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-white border-t border-[#E5E7EB] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <SectionLabel icon={<Wand2 className="w-3.5 h-3.5" />}>
            Features
          </SectionLabel>
          <h2
            className="text-[32px] sm:text-[40px] font-semibold text-[#111827] leading-tight"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            Everything you need to convert
          </h2>
          <p className="text-[#6B7280] max-w-xl">
            From AI-powered building to advanced analytics, every tool you need
            to qualify leads and book more calls.
          </p>
        </div>

        {/* 6-card grid: 2 cols on md, 3 cols on lg */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-[#2D6A4F]" />
              </div>
              <h3 className="text-lg font-semibold text-[#111827] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
