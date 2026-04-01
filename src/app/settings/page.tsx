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
  ShoppingBag,
  Link2,
  Loader2,
  Unplug,
  Code,
  Users,
  Palette,
} from "lucide-react";
import { TeamSettings } from "@/components/settings/TeamSettings";
import { ApiKeySettings } from "@/components/settings/ApiKeySettings";
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

const TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "team", label: "Team", icon: Users },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "api", label: "API Keys", icon: Code },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (typeof window !== "undefined") {
      const param = new URLSearchParams(window.location.search).get("tab");
      if (param && TABS.some(t => t.id === param)) return param as TabId;
    }
    return "account";
  });
  const [funnelCount, setFunnelCount] = useState(0);
  const [plan, setPlan] = useState<string>("free");
  const [leadAlerts, setLeadAlerts] = useState<boolean>(true);
  const [weeklyDigest, setWeeklyDigest] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Shopify state
  const [shopifyLoading, setShopifyLoading] = useState(true);
  const [shopifyConnected, setShopifyConnected] = useState(false);
  const [shopifyDomain, setShopifyDomain] = useState("");
  const [shopifyInstalledAt, setShopifyInstalledAt] = useState<string | null>(null);
  const [shopifyShopInput, setShopifyShopInput] = useState("");
  const [shopifyDisconnecting, setShopifyDisconnecting] = useState(false);

  // GHL state
  const [ghlLoading, setGhlLoading] = useState(true);
  const [ghlConnected, setGhlConnected] = useState(false);
  const [ghlLocationId, setGhlLocationId] = useState("");
  const [ghlConnectedAt, setGhlConnectedAt] = useState<string | null>(null);
  const [ghlDisconnecting, setGhlDisconnecting] = useState(false);

  useEffect(() => {
    fetch("/api/funnels")
      .then((r) => r.json())
      .then((data) => setFunnelCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setFunnelCount(0));
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

  useEffect(() => {
    fetch("/api/shopify/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.connected && data.installation) {
          setShopifyConnected(true);
          setShopifyDomain(data.installation.shopDomain ?? "");
          setShopifyInstalledAt(data.installation.installedAt ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setShopifyLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/ghl/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.connected && data.connection) {
          setGhlConnected(true);
          setGhlLocationId(data.connection.locationId ?? "");
          setGhlConnectedAt(data.connection.connectedAt ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setGhlLoading(false));
  }, []);

  async function handleShopifyDisconnect() {
    setShopifyDisconnecting(true);
    try {
      const res = await fetch("/api/shopify/disconnect", { method: "POST" });
      if (res.ok) {
        setShopifyConnected(false);
        setShopifyDomain("");
        setShopifyInstalledAt(null);
        toast.success("Shopify store disconnected");
      } else {
        toast.error("Failed to disconnect Shopify store");
      }
    } catch {
      toast.error("Failed to disconnect Shopify store");
    } finally {
      setShopifyDisconnecting(false);
    }
  }

  async function handleGhlDisconnect() {
    setGhlDisconnecting(true);
    try {
      const res = await fetch("/api/ghl/disconnect", { method: "POST" });
      if (res.ok) {
        setGhlConnected(false);
        setGhlLocationId("");
        setGhlConnectedAt(null);
        toast.success("GoHighLevel disconnected");
      } else {
        toast.error("Failed to disconnect GoHighLevel");
      }
    } catch {
      toast.error("Failed to disconnect GoHighLevel");
    } finally {
      setGhlDisconnecting(false);
    }
  }

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

  async function togglePref(key: "leadAlerts" | "weeklyDigest", current: boolean, setter: (v: boolean) => void) {
    if (saving) return;
    const next = !current;
    setter(next);
    setSaving(true);
    try {
      await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next }),
      });
    } catch {
      setter(!next);
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse mb-6" />
        <div className="h-64 bg-white rounded-xl border border-[#E5E7EB] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#111827] mb-1">Settings</h1>
      <p className="text-sm text-[#6B7280] mb-6">Manage your account, plan, and preferences.</p>

      {/* Tab bar */}
      <div className="border-b border-[#E5E7EB] mb-6">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-[#2D6A4F] text-[#2D6A4F]"
                    : "border-transparent text-[#6B7280] hover:text-[#374151] hover:border-[#D1D5DB]"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider mb-4">
              Account
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#6B7280] block mb-1">Email</label>
                <p className="text-sm text-[#111827]">
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

          {/* Danger Zone */}
          <section className="bg-white rounded-xl border border-red-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wider">
                Danger Zone
              </h2>
            </div>
            <p className="text-sm text-[#6B7280] mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors"
            >
              Delete Account
            </button>
          </section>
        </div>
      )}

      {activeTab === "billing" && (
        <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider mb-4">
            Plan & Billing
          </h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#111827]">
                  {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#2D6A4F]/10 text-[#2D6A4F]">
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {plan === "free" ? `${funnelCount} of 1 funnels used` : `${funnelCount} funnels (unlimited)`}
              </p>
            </div>
          </div>
          {plan === "free" ? (
            <>
              <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-4 mb-4">
                <p className="text-xs font-semibold text-[#111827] uppercase tracking-wider mb-3">
                  Unlock with Pro
                </p>
                <ul className="space-y-2">
                  {["Unlimited funnels", "Custom domains", "Advanced analytics & scoring", "Priority support", "Remove MyVSL branding"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Check className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                      {f}
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
      )}

      {activeTab === "notifications" && (
        <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider mb-4">
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#111827]">New lead email alerts</p>
                <p className="text-xs text-[#6B7280] mt-0.5">Get notified when a new lead completes your funnel</p>
              </div>
              <button
                disabled={saving}
                onClick={() => togglePref("leadAlerts", leadAlerts, setLeadAlerts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${leadAlerts ? "bg-[#2D6A4F]" : "bg-gray-200"}`}
                role="switch"
                aria-checked={leadAlerts}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${leadAlerts ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            <div className="border-t border-[#E5E7EB]" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#111827]">Weekly performance digest</p>
                <p className="text-xs text-[#6B7280] mt-0.5">Receive a weekly summary of funnel performance</p>
              </div>
              <button
                disabled={saving}
                onClick={() => togglePref("weeklyDigest", weeklyDigest, setWeeklyDigest)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${weeklyDigest ? "bg-[#2D6A4F]" : "bg-gray-200"}`}
                role="switch"
                aria-checked={weeklyDigest}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${weeklyDigest ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        </section>
      )}

      {activeTab === "team" && (
        <TeamSettings />
      )}

      {activeTab === "integrations" && (
        <div className="space-y-6">
          {/* Shopify */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-4 h-4 text-[#6B7280]" />
              <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider">Shopify</h2>
            </div>
            {shopifyLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Loader2 className="w-4 h-4 animate-spin" /> Checking connection...
              </div>
            ) : shopifyConnected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-green-100 text-green-700">Connected</span>
                  <span className="text-sm text-[#111827] font-medium">{shopifyDomain}</span>
                </div>
                {shopifyInstalledAt && <p className="text-xs text-[#6B7280]">Connected {new Date(shopifyInstalledAt).toLocaleDateString()}</p>}
                <button
                  onClick={handleShopifyDisconnect}
                  disabled={shopifyDisconnecting}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50"
                >
                  {shopifyDisconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unplug className="w-3 h-3" />}
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[#6B7280]">Install on your Shopify store to automatically show popups to visitors.</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={shopifyShopInput}
                    onChange={(e) => setShopifyShopInput(e.target.value)}
                    placeholder="your-store.myshopify.com"
                    className="max-w-xs text-sm"
                  />
                  <a
                    href={shopifyShopInput ? `/api/shopify/install?shop=${encodeURIComponent(shopifyShopInput)}` : "#"}
                    onClick={(e) => {
                      if (!shopifyShopInput || !shopifyShopInput.endsWith(".myshopify.com")) {
                        e.preventDefault();
                        toast.error("Enter a valid .myshopify.com domain");
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#2D6A4F] px-4 py-2 text-sm font-medium text-white hover:bg-[#245840] transition-colors shrink-0"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Connect Shopify
                  </a>
                </div>
              </div>
            )}
          </section>

          {/* GoHighLevel */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="w-4 h-4 text-[#6B7280]" />
              <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider">GoHighLevel</h2>
            </div>
            {ghlLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Loader2 className="w-4 h-4 animate-spin" /> Checking connection...
              </div>
            ) : ghlConnected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-green-100 text-green-700">Connected</span>
                  <span className="text-sm text-[#111827] font-medium">Location: {ghlLocationId}</span>
                </div>
                {ghlConnectedAt && <p className="text-xs text-[#6B7280]">Connected {new Date(ghlConnectedAt).toLocaleDateString()}</p>}
                <button
                  onClick={handleGhlDisconnect}
                  disabled={ghlDisconnecting}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50"
                >
                  {ghlDisconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unplug className="w-3 h-3" />}
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[#6B7280]">Connect your GHL sub-account to sync leads automatically.</p>
                <a
                  href="/api/ghl/install"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2D6A4F] px-4 py-2 text-sm font-medium text-white hover:bg-[#245840] transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Connect GoHighLevel
                </a>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === "api" && (
        <ApiKeySettings />
      )}

      {/* Delete account dialog */}
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
            <label className="text-sm font-medium text-[#111827]">
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
            <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeleteConfirm(""); }} disabled={deleting}>
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
