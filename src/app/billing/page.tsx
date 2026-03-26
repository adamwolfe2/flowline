"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { CreditCard, Check, Zap, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const PLANS = {
  free: {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    features: ["1 funnel", "100 submissions / month", "Basic analytics", "MyVSL branding", "Community support"],
  },
  pro: {
    name: "Pro",
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      "Unlimited funnels",
      "Unlimited submissions",
      "Advanced analytics & scoring",
      "Custom domains",
      "Remove MyVSL branding",
      "Calendar integrations",
      "Priority support",
    ],
  },
  agency: {
    name: "Agency",
    monthlyPrice: 149,
    annualPrice: 119,
    features: [
      "Everything in Pro",
      "Unlimited workspaces",
      "White-label branding",
      "Client sub-accounts",
      "Team collaboration",
      "API access",
      "Dedicated account manager",
    ],
  },
} as const;

type PlanKey = keyof typeof PLANS;

const PRICE_MAP: Record<string, { monthly: string; annual: string }> = {
  pro: {
    monthly: "pro_monthly",
    annual: "pro_annual",
  },
  agency: {
    monthly: "agency_monthly",
    annual: "agency_annual",
  },
};

export default function BillingPage() {
  const { isLoaded } = useUser();
  const [currentPlan, setCurrentPlan] = useState<PlanKey>("free");
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        if (data.plan && ["free", "pro", "agency"].includes(data.plan)) {
          setCurrentPlan(data.plan as PlanKey);
        }
      })
      .catch(() => {});
  }, []);

  async function handleUpgrade(plan: PlanKey) {
    if (plan === "free" || plan === currentPlan) return;

    const priceEnvKey = PRICE_MAP[plan]?.[annual ? "annual" : "monthly"];
    if (!priceEnvKey) return;

    setLoading(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: priceEnvKey }),
      });
      const data = await res.json();

      if (res.status === 503) {
        toast.error("Billing is not configured yet. Check back soon!");
        setLoading(null);
        return;
      }

      if (!res.ok) {
        toast.error("Failed to start checkout. Please try again.");
        setLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Something went wrong. Try again.");
      setLoading(null);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();

      if (res.status === 503) {
        toast.error("Billing is not configured yet.");
        setPortalLoading(false);
        return;
      }

      if (!res.ok) {
        toast.error("Failed to open billing portal. Please try again.");
        setPortalLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Something went wrong.");
      setPortalLoading(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-white rounded-xl border border-[#EBEBEB] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard className="w-5 h-5 text-[#737373]" />
        <h1
          className="text-2xl font-semibold text-[#333333]"
          style={{ fontFamily: "var(--font-outfit, inherit)" }}
        >
          Billing
        </h1>
      </div>
      <p className="text-sm text-[#737373] mb-8">
        Manage your subscription and billing details.
      </p>

      {/* Monthly / Annual toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={`text-sm font-medium ${!annual ? "text-[#333333]" : "text-[#A3A3A3]"}`}>
          Monthly
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          role="switch"
          aria-checked={annual}
          aria-label="Toggle annual billing"
          className={`relative w-12 h-7 rounded-full transition-colors ${
            annual ? "bg-[#2D6A4F]" : "bg-gray-300"
          }`}
        >
          <div
            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              annual ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${annual ? "text-[#333333]" : "text-[#A3A3A3]"}`}>
          Annual
        </span>
        {annual && (
          <span className="text-xs font-semibold text-[#2D6A4F] bg-green-50 px-2 py-0.5 rounded-full">
            Save 20%
          </span>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(Object.keys(PLANS) as PlanKey[]).map((key) => {
          const plan = PLANS[key];
          const isCurrent = key === currentPlan;
          const price = annual ? plan.annualPrice : plan.monthlyPrice;

          return (
            <div
              key={key}
              className={`bg-white rounded-xl border p-6 transition-all ${
                isCurrent
                  ? "border-[#2D6A4F] ring-1 ring-[#2D6A4F]"
                  : "border-[#EBEBEB] hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#333333]">{plan.name}</h3>
                {isCurrent && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#2D6A4F]/10 text-[#2D6A4F]">
                    Current
                  </span>
                )}
              </div>

              <div className="mb-5">
                <span className="text-3xl font-bold text-[#333333]">
                  ${price}
                </span>
                {price > 0 && (
                  <span className="text-sm text-[#737373]">/mo{annual ? " billed annually" : ""}</span>
                )}
                {price === 0 && (
                  <span className="text-sm text-[#737373] ml-1">forever</span>
                )}
              </div>

              {/* CTA button at top, before features */}
              <div className="mb-6">
              {isCurrent ? (
                currentPlan !== "free" ? (
                  <button
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#EBEBEB] px-4 py-2.5 text-sm font-medium text-[#333333] hover:bg-gray-50 transition-colors"
                  >
                    {portalLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Manage Billing
                        <ExternalLink className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full text-center text-sm text-[#A3A3A3] py-2.5">
                    Current plan
                  </div>
                )
              ) : (
                <button
                  onClick={() => handleUpgrade(key)}
                  disabled={loading !== null}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2D6A4F] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#245840] transition-colors disabled:opacity-50"
                >
                  {loading === key ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      Upgrade to {plan.name}
                    </>
                  )}
                </button>
              )}
              </div>

              {/* Features list below button */}
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[#737373]">
                    <Check className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
