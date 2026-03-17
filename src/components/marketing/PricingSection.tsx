"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Get started — no credit card required",
    features: [
      "1 funnel",
      "100 leads / month",
      "Basic quiz builder",
      "Qualifi branding",
      "Community support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    monthlyPrice: 49,
    annualPrice: 39,
    description: "For coaches and consultants scaling bookings",
    features: [
      "Unlimited funnels",
      "Unlimited leads",
      "Custom domain",
      "Full analytics dashboard",
      "Lead scoring & routing",
      "Remove Qualifi branding",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Agency",
    monthlyPrice: 149,
    annualPrice: 119,
    description: "White-label funnels for your clients",
    features: [
      "Everything in Pro",
      "Client workspaces",
      "White-label branding",
      "Team member seats",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="bg-[#FAFAFA] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-indigo-600 uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Simple pricing that scales with you
          </h2>
          <p className="font-[family-name:var(--font-dm-sans)] text-gray-500 max-w-md mx-auto">
            Start free. Upgrade when you need more power.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center bg-white border border-gray-200 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`text-sm px-5 py-2 rounded-full transition-colors ${
                !annual
                  ? "bg-[#09090B] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`text-sm px-5 py-2 rounded-full transition-colors ${
                annual
                  ? "bg-[#09090B] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Annual
              <span className="ml-1.5 text-xs text-emerald-500 font-medium">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative bg-white rounded-2xl p-8 border ${
                  plan.popular
                    ? "border-indigo-300 shadow-lg shadow-indigo-100 scale-[1.02]"
                    : "border-gray-200 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6366F1] text-white text-xs font-medium px-4 py-1 rounded-full">
                    Most popular
                  </div>
                )}

                <h3 className="font-[family-name:var(--font-sora)] text-lg font-semibold text-gray-900 mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="font-[family-name:var(--font-sora)] text-4xl font-bold text-gray-900">
                    ${price}
                  </span>
                  {price > 0 && (
                    <span className="text-sm text-gray-400 ml-1">/month</span>
                  )}
                </div>

                <Link
                  href={plan.name === "Agency" ? "#contact" : "/sign-up"}
                  className={`block text-center text-sm font-medium py-3 rounded-xl transition-colors mb-8 ${
                    plan.popular
                      ? "bg-[#6366F1] text-white hover:bg-[#5558E6]"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
