"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import {
  User,
  CreditCard,
  AlertTriangle,
  ExternalLink,
  Check,
  Zap,
  Bell,
} from "lucide-react";
import { TeamSettings } from "@/components/settings/TeamSettings";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const [funnelCount, setFunnelCount] = useState(0);
  const [plan, setPlan] = useState<string>("free");
  const [leadAlerts, setLeadAlerts] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("myvsl_notif_lead_alerts");
      return stored !== null ? stored === "true" : true;
    }
    return true;
  });
  const [weeklyDigest, setWeeklyDigest] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("myvsl_notif_weekly_digest");
      return stored !== null ? stored === "true" : true;
    }
    return true;
  });

  useEffect(() => {
    fetch("/api/funnels")
      .then((r) => r.json())
      .then((data) => {
        setFunnelCount(Array.isArray(data) ? data.length : 0);
      })
      .catch(() => {
        setFunnelCount(0);
      });
  }, []);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        if (data.plan) setPlan(data.plan);
      })
      .catch(() => {});
  }, []);

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-48 bg-white rounded-xl border border-[#EBEBEB] animate-pulse" />
        <div className="h-64 bg-white rounded-xl border border-[#EBEBEB] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1
        className="text-2xl font-semibold text-[#333333] mb-1"
        style={{ fontFamily: "var(--font-outfit, inherit)" }}
      >
        Settings
      </h1>
      <p className="text-sm text-[#737373] mb-8">
        Manage your account, plan, and preferences.
      </p>

      {/* Account */}
      <section className="bg-white rounded-xl border border-[#EBEBEB] p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-[#737373]" />
          <h2 className="text-sm font-semibold text-[#333333] uppercase tracking-wider">
            Account
          </h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#737373] block mb-1">Email</label>
            <p className="text-sm text-[#333333]">
              {user?.primaryEmailAddress?.emailAddress ?? "No email found"}
            </p>
          </div>

          <button
            onClick={() => openUserProfile()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2D6A4F] hover:text-[#245840] transition-colors"
          >
            Manage Account
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Plan & Billing */}
      <section className="bg-white rounded-xl border border-[#EBEBEB] p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-[#737373]" />
          <h2 className="text-sm font-semibold text-[#333333] uppercase tracking-wider">
            Plan & Billing
          </h2>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#333333]">
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#2D6A4F]/10 text-[#2D6A4F]">
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-0.5">
              {plan === "free" ? `${funnelCount} of 1 funnels used` : `${funnelCount} funnels (unlimited)`}
            </p>
          </div>
        </div>

        {plan === "free" ? (
          <>
            <div className="bg-[#FBFBFB] rounded-lg border border-[#EBEBEB] p-4 mb-4">
              <p className="text-xs font-semibold text-[#333333] uppercase tracking-wider mb-3">
                Unlock with Pro
              </p>
              <ul className="space-y-2">
                {[
                  "Unlimited funnels",
                  "Custom domains",
                  "Advanced analytics & scoring",
                  "Priority support",
                  "Remove MyVSL branding",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-[#737373]"
                  >
                    <Check className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2D6A4F] px-4 py-2 text-sm font-medium text-white hover:bg-[#245840] transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Upgrade to Pro
            </Link>
          </>
        ) : (
          <Link
            href="/billing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2D6A4F] hover:text-[#245840] transition-colors"
          >
            Manage Billing
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-xl border border-[#EBEBEB] p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-[#737373]" />
          <h2 className="text-sm font-semibold text-[#333333] uppercase tracking-wider">
            Notifications
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#333333]">New lead email alerts</p>
              <p className="text-xs text-[#737373] mt-0.5">Get notified when a new lead completes your funnel</p>
            </div>
            <button
              onClick={() => {
                const next = !leadAlerts;
                setLeadAlerts(next);
                localStorage.setItem("myvsl_notif_lead_alerts", String(next));
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                leadAlerts ? "bg-[#2D6A4F]" : "bg-gray-200"
              }`}
              role="switch"
              aria-checked={leadAlerts}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  leadAlerts ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="border-t border-[#EBEBEB]" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#333333]">Weekly performance digest</p>
              <p className="text-xs text-[#737373] mt-0.5">Receive a weekly summary of funnel performance</p>
            </div>
            <button
              onClick={() => {
                const next = !weeklyDigest;
                setWeeklyDigest(next);
                localStorage.setItem("myvsl_notif_weekly_digest", String(next));
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                weeklyDigest ? "bg-[#2D6A4F]" : "bg-gray-200"
              }`}
              role="switch"
              aria-checked={weeklyDigest}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  weeklyDigest ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <p className="text-[10px] text-[#A3A3A3] mt-4">
          Preferences saved locally. Server-side delivery coming soon.
        </p>
      </section>

      {/* Team */}
      <TeamSettings />

      {/* Danger Zone */}
      <section className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wider">
            Danger Zone
          </h2>
        </div>

        <p className="text-sm text-[#737373] mb-4">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>

        <button
          disabled
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-400 cursor-not-allowed opacity-60"
          title="Contact support to delete your account"
        >
          Delete Account
        </button>
        <p className="text-xs text-[#A3A3A3] mt-2">
          Contact{" "}
          <a href="mailto:support@getmyvsl.com" className="text-[#2D6A4F] hover:underline">
            support@getmyvsl.com
          </a>{" "}
          to delete your account.
        </p>
      </section>
    </div>
  );
}
