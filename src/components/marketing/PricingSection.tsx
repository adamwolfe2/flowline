"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Get started with quiz funnels.",
    features: [
      "1 funnel",
      "100 submissions / month",
      "Basic analytics",
      "MyVSL branding",
      "Community support",
    ],
    cta: "Get Started",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Pro",
    monthlyPrice: 49,
    annualPrice: 39,
    description: "For growing businesses that need more.",
    features: [
      "Unlimited funnels",
      "Unlimited submissions",
      "Advanced analytics & scoring",
      "Custom domains",
      "Remove MyVSL branding",
      "Calendar integrations",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/sign-up?plan=pro",
    popular: true,
  },
  {
    name: "Agency",
    monthlyPrice: 149,
    annualPrice: 119,
    description: "For teams managing multiple clients.",
    features: [
      "Everything in Pro",
      "Unlimited workspaces",
      "White-label branding",
      "Client sub-accounts",
      "Team collaboration",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Start Free Trial",
    href: "/sign-up?plan=agency",
    popular: false,
  },
];

export function PricingSection({ standalone = false }: { standalone?: boolean }) {
  const [annual, setAnnual] = useState(true);

  return (
    <section
      className={standalone ? "py-12 sm:py-20 px-4 sm:px-6" : "py-14 sm:py-24 px-4 sm:px-6 bg-white"}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-semibold text-[#111827] mb-3"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            {standalone ? "Simple, transparent pricing" : "Pricing"}
          </h2>
          <p className="text-[#6B7280] max-w-md mx-auto">
            {standalone
              ? "Start free. Upgrade when you're ready. No hidden fees."
              : "Start free, upgrade when you need more."}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span
            className={`text-sm font-medium transition-colors ${
              !annual ? "text-[#111827]" : "text-[#9CA3AF]"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              annual ? "bg-[#2D6A4F]" : "bg-[#D1D5DB]"
            }`}
            aria-label="Toggle annual billing"
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                annual ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium transition-colors ${
              annual ? "text-[#111827]" : "text-[#9CA3AF]"
            }`}
          >
            Annual
          </span>
          {annual && (
            <span className="text-xs font-semibold text-[#2D6A4F] bg-[#2D6A4F]/10 px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-5 sm:p-8 flex flex-col ${
                  plan.popular
                    ? "border-[#2D6A4F] shadow-[0_0_0_1px_#2D6A4F] bg-white"
                    : "border-[#E5E7EB] bg-white"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#2D6A4F] text-white">
                      Most popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-[#111827] mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[#6B7280]">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold text-[#111827]">
                      ${price}
                    </span>
                    {price > 0 && (
                      <span className="text-sm text-[#9CA3AF]">/mo</span>
                    )}
                  </div>
                  {price > 0 && annual && (
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Billed annually (${price * 12}/yr)
                    </p>
                  )}
                  {price === 0 && (
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Free forever
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-10 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-[#6B7280]"
                    >
                      <Check className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`w-full text-center rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    plan.popular
                      ? "bg-[#2D6A4F] text-white hover:bg-[#245840]"
                      : "border border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
