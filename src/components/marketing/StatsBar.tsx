"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { target: 500, format: (n: number) => `${Math.round(n)}+`, label: "Funnels created" },
  { target: 25000, format: (n: number) => `${Math.round(n).toLocaleString()}+`, label: "Leads captured" },
  { target: 60, format: (n: number) => `${Math.round(n)}s`, label: "Average build time" },
  { target: 3.2, format: (n: number) => `${n.toFixed(1)}x`, label: "More leads vs forms" },
];

function CountUp({ target, format }: { target: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(format(0));

  useEffect(() => {
    if (!inView) return;
    const duration = 1300;
    let raf: number;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      // ease-out-quint for a fast start that settles gently
      const eased = 1 - Math.pow(1 - p, 5);
      setDisplay(format(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, format]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="bg-white py-14 sm:py-20 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col items-center text-center"
            >
              <span
                className="text-4xl sm:text-5xl font-bold text-[#0A0A0A] tracking-[-0.03em]"
                style={{ fontFamily: "var(--font-instrument-sans)" }}
              >
                <CountUp target={stat.target} format={stat.format} />
              </span>
              <span className="text-sm sm:text-base text-[#6B7280] mt-2">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
