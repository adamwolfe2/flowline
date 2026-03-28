"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";

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

const faqs = [
  {
    question: "Can I try before I buy?",
    answer:
      "Yes, the free plan lets you create 1 funnel with full functionality. No credit card required.",
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer:
      "Yes, changes take effect immediately. If you downgrade, you keep access to your current features until the end of your billing period.",
  },
  {
    question: "Do you charge per lead?",
    answer:
      "Never. All plans include unlimited leads. You only pay a flat monthly fee based on your plan.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes, Pro and Agency plans support custom domains. Connect your domain in the funnel settings after publishing.",
  },
  {
    question: "Is there a contract?",
    answer:
      "No contracts. Cancel anytime with one click from your billing settings. No questions asked.",
  },
];

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F9FAFB] transition-colors"
      >
        <span className="text-sm font-medium text-[#111827]">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#9CA3AF] transition-transform flex-shrink-0 ml-4 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-[#6B7280] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

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
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto overflow-x-auto snap-x snap-mandatory -mx-4 px-4 md:mx-auto md:px-0 md:overflow-visible scrollbar-hide">
          {plans.map((plan) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-5 sm:p-8 flex flex-col min-w-[260px] md:min-w-0 snap-center shrink-0 md:shrink ${
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
                  {price > 0 && !annual && (
                    <p className="text-xs text-[#2D6A4F] mt-1">
                      Switch to annual and save 20%
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

        {/* FAQ Section */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h3
            className="text-2xl font-semibold text-[#111827] text-center mb-8"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            Frequently asked questions
          </h3>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
