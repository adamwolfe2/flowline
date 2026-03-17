"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="bg-[#09090B] py-20 md:py-28 relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            Stop chasing leads.
            <br />
            Start closing them.
          </h2>
          <p className="font-[family-name:var(--font-dm-sans)] text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Build your first qualifying funnel in under 60 seconds. Free
            forever for up to 100 leads per month.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-[#6366F1] hover:bg-[#5558E6] text-white font-medium text-lg px-10 py-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
          >
            Build My Funnel Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-gray-500">
            No credit card required. Set up in 60 seconds.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
