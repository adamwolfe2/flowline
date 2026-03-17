"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "We went from 40% no-show rate to under 15%. The quiz pre-qualifies leads so well that by the time they book, they're already sold.",
    name: "Sarah M.",
    role: "Business Coach",
    initials: "SM",
  },
  {
    quote:
      "Set up our first funnel in literally two minutes. We embedded it on our VSL page and saw a 28% increase in qualified bookings within the first week.",
    name: "James K.",
    role: "Agency Owner",
    initials: "JK",
  },
  {
    quote:
      "The scoring system is a game-changer. Our sales team only talks to people who are actually ready to buy. Closed revenue is up 3x this quarter.",
    name: "Priya R.",
    role: "SaaS Founder",
    initials: "PR",
  },
];

export function TestimonialsSection() {
  return (
    <section id="examples" className="py-20 md:py-28" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: "#D4A24E" }}>
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Teams that ship faster with Qualifi
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="bg-white rounded-2xl p-7 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: "#D4A24E" }}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
