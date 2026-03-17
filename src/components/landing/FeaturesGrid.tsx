"use client";

import { useInView } from "@/hooks/useInView";
import { Sparkles, Target, Globe, BarChart3, Calendar, Link2 } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Generated Funnels",
    description: "Describe your business in one sentence. AI writes your headline, questions, and scoring logic.",
  },
  {
    icon: Target,
    title: "Smart Lead Scoring",
    description: "Automatically score leads and route high-value prospects to your best calendar slot.",
  },
  {
    icon: Globe,
    title: "One-Click Publish",
    description: "Go live on your subdomain instantly. Connect a custom domain on the Pro plan.",
  },
  {
    icon: BarChart3,
    title: "Drop-off Analytics",
    description: "See exactly where visitors abandon your funnel. Optimize every question for conversions.",
  },
  {
    icon: Calendar,
    title: "Calendar Routing",
    description: "Route hot leads to discovery calls, warm leads to intros, and others to learn-more pages.",
  },
  {
    icon: Link2,
    title: "Webhook Integrations",
    description: "Send lead data to Zapier, Make, HubSpot, or any CRM the moment they submit.",
  },
];

export function FeaturesGrid() {
  const { ref, inView } = useInView(0.1);

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-5xl mx-auto" ref={ref}>
        <p className="text-xs uppercase tracking-wider text-gray-400 mb-4 text-center">Features</p>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 text-center mb-4 tracking-tight">
          Everything you need to convert
        </h2>
        <p className="text-sm text-gray-500 text-center mb-16 max-w-md mx-auto">
          Built for one thing: turning visitors into booked calls. Nothing more, nothing less.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`bg-white border border-gray-200 rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-[18px] h-[18px] text-gray-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
