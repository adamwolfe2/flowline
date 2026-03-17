"use client";

import { useState, useEffect } from "react";
import { useInView } from "@/hooks/useInView";

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.5);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 2400, suffix: "+", label: "Funnels created" },
  { value: 180, suffix: "k+", label: "Leads captured" },
  { value: 94, suffix: "%", label: "Avg. completion rate" },
];

export function StatsBar() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-3 divide-x divide-gray-200">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center px-4">
              <p className="text-3xl md:text-4xl font-semibold text-gray-900 mb-1">
                <Counter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
