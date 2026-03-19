"use client";

import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";

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

const testimonials = [
  {
    quote:
      "Our no-show rate dropped from 40% to under 15% after switching to MyVSL. The scoring system filters out tire-kickers before they even hit our calendar.",
    name: "Sarah Mitchell",
    title: "Founder",
    company: "Mitchell Coaching",
    initials: "SM",
    color: "#4A90D9",
  },
  {
    quote:
      "We saw a 28% increase in qualified bookings in the first week. The analytics showed us exactly which question was causing drop-off, so we fixed it in 5 minutes.",
    name: "James Kim",
    title: "CEO",
    company: "Precision Agency",
    initials: "JK",
    color: "#F6C744",
  },
  {
    quote:
      "The fact that hot leads go straight to our senior team while warm leads get an intro call? That alone doubled our close rate. Revenue is up 3x.",
    name: "Priya Reddy",
    title: "VP Sales",
    company: "ScaleWise",
    initials: "PR",
    color: "#4BC0A0",
  },
];

const ratings = [
  { platform: "Trustpilot", score: "4.7/5", stars: 5 },
  { platform: "G2", score: "5/5", stars: 5 },
  { platform: "Product Hunt", score: "4.7/5", stars: 5 },
];

export function TestimonialsSection() {
  return (
    <section className="bg-white border-t border-[#E5E7EB] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <SectionLabel icon={<Heart className="w-3.5 h-3.5" />}>
            Results
          </SectionLabel>
          <h2
            className="text-[32px] sm:text-[40px] font-semibold text-[#111827] leading-tight"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            What happens when you go live
          </h2>
        </div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-3.5 h-3.5 fill-[#2D6A4F] text-[#2D6A4F]"
                  />
                ))}
              </div>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                  style={{ backgroundColor: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    {t.title}, {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ratings row */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-[#E5E7EB]">
            {ratings.map((r) => (
              <div
                key={r.platform}
                className="flex flex-col items-center py-6 px-4"
              >
                <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                  {r.platform}
                </span>
                <div className="flex items-center gap-0.5 mb-1">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <span key={j} className="text-[#2D6A4F] text-sm">
                      &#9733;
                    </span>
                  ))}
                </div>
                <span className="text-lg font-semibold text-[#111827]">
                  {r.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
