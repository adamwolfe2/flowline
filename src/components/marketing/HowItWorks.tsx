"use client";

import { motion } from "framer-motion";
import { PenLine, BrainCircuit, CalendarCheck } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: PenLine,
    title: "Build Your Quiz",
    description:
      "Drop in 2-5 qualifying questions. Add scoring rules. Customize the look to match your brand — all in a visual builder.",
  },
  {
    num: "02",
    icon: BrainCircuit,
    title: "Score & Segment",
    description:
      "Each answer carries a point value. Qualifi scores every lead in real time and routes them to the right next step automatically.",
  },
  {
    num: "03",
    icon: CalendarCheck,
    title: "Book Qualified Calls",
    description:
      "High-scoring leads land on your calendar. Low scorers get a nurture sequence. No manual filtering — ever.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: "#D4A24E" }}>
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            From stranger to booked call in three steps
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#D4A24E15" }}>
                    <Icon className="w-5 h-5" style={{ color: "#D4A24E" }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#D4A24E" }}>
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
