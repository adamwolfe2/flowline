"use client";

import { useInView } from "@/hooks/useInView";
import {
  Sparkles,
  Target,
  Globe,
  BarChart3,
  Calendar,
  Link2,
} from "lucide-react";

const features = [
  {
    title: "AI-Generated Funnels",
    description:
      "Describe your business in one sentence. AI writes your headline, questions, and scoring logic.",
    icon: Sparkles,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Smart Lead Scoring",
    description:
      "Automatically score leads and route hot prospects to your best calendar.",
    icon: Target,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    title: "One-Click Publish",
    description:
      "Go live on your subdomain instantly. Connect a custom domain on Pro.",
    icon: Globe,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Drop-off Analytics",
    description:
      "See exactly where visitors abandon your funnel. Optimize every question.",
    icon: BarChart3,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Calendar Routing",
    description:
      "Route high-value leads to discovery calls and others to intro calls.",
    icon: Calendar,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Webhook Integrations",
    description:
      "Send leads to Zapier, Make, HubSpot, or any CRM automatically.",
    icon: Link2,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

export function FeaturesGrid() {
  const { ref, inView } = useInView(0.1);

  return (
    <section id="features" className="py-24 px-6 bg-gray-50/60">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Everything you need to convert
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`bg-white border border-gray-100 rounded-2xl p-7 transition-all duration-700 hover:border-gray-200 hover:shadow-sm ${
                  inView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
