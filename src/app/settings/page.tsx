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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const [funnelCount, setFunnelCount] = useState(0);
  const [plan, setPlan] = useState<string>("free");
  const [leadAlerts, setLeadAlerts] = useState<boolean>(true);
  const [weeklyDigest, setWeeklyDigest] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

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
        if (data.notificationPreferences) {
          setLeadAlerts(data.notificationPreferences.leadAlerts ?? true);
          setWeeklyDigest(data.notificationPreferences.weeklyDigest ?? true);
        }
      })
      .catch(() => {});
  }, []);

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/";
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to delete account. Please contact support.");
      }
    } catch {
      toast.error("Failed to delete account. Please contact support.");
    } finally {
      setDeleting(false);
    }
  }

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
              disabled={saving}
              onClick={async () => {
                if (saving) return;
                const next = !leadAlerts;
                setLeadAlerts(next);
                setSaving(true);
                try {
                  await fetch("/api/user/preferences", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ leadAlerts: next }),
                  });
                } catch {
                  setLeadAlerts(!next);
                } finally {
                  setSaving(false);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${
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
              disabled={saving}
              onClick={async () => {
                if (saving) return;
                const next = !weeklyDigest;
                setWeeklyDigest(next);
                setSaving(true);
                try {
                  await fetch("/api/user/preferences", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ weeklyDigest: next }),
                  });
                } catch {
                  setWeeklyDigest(!next);
                } finally {
                  setSaving(false);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${
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
          onClick={() => setDeleteOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors"
        >
          Delete Account
        </button>
      </section>

      <Dialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteConfirm(""); }}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, all funnels, leads, and analytics. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700 font-medium">Warning: All your data will be permanently erased.</p>
            <p className="text-xs text-red-600 mt-1">This includes all funnels, leads, sessions, analytics, and account settings.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#333333]">
              Type <span className="font-bold font-mono">DELETE</span> to confirm
            </label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
              autoComplete="off"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDeleteOpen(false); setDeleteConfirm(""); }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== "DELETE" || deleting}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
