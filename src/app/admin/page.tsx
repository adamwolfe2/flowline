"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Layers, Mail, CalendarDays, MousePointerClick, Activity, Globe, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  totalFunnels: number;
  publishedFunnels: number;
  totalLeads: number;
  totalSessions: number;
  totalEvents: number;
  leadsToday: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  conversionRate: number;
  planBreakdown: { free: number; pro: number; agency: number };
  usersThisWeek: number;
  usersThisMonth: number;
  activeEnrollments: number;
  totalWebhookDeliveries: number;
  recentUsers: {
    id: string;
    email: string;
    plan: string;
    createdAt: string;
  }[];
  topFunnels: {
    funnelId: string;
    count: number;
  }[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState<{
    domains: Array<{
      funnelId: string;
      domain: string;
      slug: string;
      published: boolean;
      userId: string;
      funnelName: string;
      registeredInVercel: boolean;
    }>;
    vercelConfigured: boolean;
    totalVercelDomains: number;
  } | null>(null);
  const [domainAction, setDomainAction] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 403 ? "Forbidden" : "Failed to load");
        return res.json();
      })
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/domains")
      .then(r => r.ok ? r.json() : null)
      .then(setDomains)
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-sm text-[#737373]">Loading admin stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-sm text-red-600">{error === "Forbidden" ? "Access denied." : "Something went wrong."}</div>
      </div>
    );
  }

  if (!stats) return null;

  const primaryCards = [
    { label: "Total Users", value: stats.totalUsers, sub: `${stats.usersThisWeek} this week / ${stats.usersThisMonth} this month`, icon: Users },
    { label: "Funnels", value: `${stats.publishedFunnels} / ${stats.totalFunnels}`, sub: "published / total", icon: Layers },
    { label: "Total Leads", value: stats.totalLeads.toLocaleString(), sub: `${stats.leadsToday} today / ${stats.leadsThisWeek} this week`, icon: Mail },
    { label: "Conversion Rate", value: `${stats.conversionRate}%`, sub: `${stats.totalSessions.toLocaleString()} sessions total`, icon: Activity },
    { label: "Sessions Today", value: stats.sessionsToday.toLocaleString(), sub: `${stats.sessionsThisWeek.toLocaleString()} this week`, icon: MousePointerClick },
    { label: "Total Events", value: stats.totalEvents.toLocaleString(), icon: CalendarDays },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#333333]">Platform Overview</h1>
        <span className="text-[10px] text-[#9CA3AF]">Super Admin</span>
      </div>

      {/* Plan breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-4">
          <p className="text-xs text-[#9CA3AF] mb-1">Free Users</p>
          <p className="text-2xl font-bold text-[#333333]">{stats.planBreakdown.free}</p>
        </div>
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-4">
          <p className="text-xs text-[#2D6A4F] mb-1">Pro Users</p>
          <p className="text-2xl font-bold text-[#2D6A4F]">{stats.planBreakdown.pro}</p>
        </div>
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-4">
          <p className="text-xs text-[#7C3AED] mb-1">Agency Users</p>
          <p className="text-2xl font-bold text-[#7C3AED]">{stats.planBreakdown.agency}</p>
        </div>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {primaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-[#FBFBFB] border border-[#EBEBEB] rounded-lg p-4 space-y-1"
          >
            <div className="flex items-center gap-1.5 text-[#737373]">
              <card.icon className="w-3.5 h-3.5" />
              <span className="text-xs">{card.label}</span>
            </div>
            <div className="text-xl font-semibold text-[#333333]">{card.value}</div>
            {card.sub && <div className="text-[10px] text-[#999999]">{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* System health */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#FBFBFB] border border-[#EBEBEB] rounded-lg p-4">
          <p className="text-xs text-[#737373] mb-1">Active Email Enrollments</p>
          <p className="text-lg font-semibold text-[#333333]">{stats.activeEnrollments}</p>
        </div>
        <div className="bg-[#FBFBFB] border border-[#EBEBEB] rounded-lg p-4">
          <p className="text-xs text-[#737373] mb-1">Webhook Deliveries Logged</p>
          <p className="text-lg font-semibold text-[#333333]">{stats.totalWebhookDeliveries}</p>
        </div>
      </div>

      {/* Recent Users */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#333333]">Recent Users</h2>
        <div className="bg-[#FBFBFB] border border-[#EBEBEB] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EBEBEB] text-left text-[#737373]">
                <th className="px-4 py-2 font-medium text-xs">Email</th>
                <th className="px-4 py-2 font-medium text-xs">Plan</th>
                <th className="px-4 py-2 font-medium text-xs">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#EBEBEB] last:border-0">
                  <td className="px-4 py-2 text-[#333333]">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block text-xs px-2 py-0.5 rounded bg-[#EBEBEB] text-[#555555] capitalize">
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[#737373] text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {stats.recentUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-[#999999] text-xs">No users yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top Funnels */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#333333]">Top Funnels by Leads (last 30 days)</h2>
        <div className="bg-[#FBFBFB] border border-[#EBEBEB] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EBEBEB] text-left text-[#737373]">
                <th className="px-4 py-2 font-medium text-xs">Funnel ID</th>
                <th className="px-4 py-2 font-medium text-xs text-right">Leads</th>
              </tr>
            </thead>
            <tbody>
              {stats.topFunnels.map((f) => (
                <tr key={f.funnelId} className="border-b border-[#EBEBEB] last:border-0">
                  <td className="px-4 py-2">
                    <Link href={`/analytics/${f.funnelId}`} className="text-[#2D6A4F] hover:underline font-mono text-xs">
                      {f.funnelId.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right text-[#333333] font-semibold">{f.count}</td>
                </tr>
              ))}
              {stats.topFunnels.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-[#999999] text-xs">No leads this month</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Domain Management */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#333333]">Custom Domains</h2>
          {domains && (
            <span className="text-[10px] text-[#999999]">
              Vercel: {domains.vercelConfigured ? "Connected" : "Not configured"} | {domains.totalVercelDomains} domains registered
            </span>
          )}
        </div>
        <div className="bg-[#FBFBFB] border border-[#EBEBEB] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EBEBEB] text-left text-[#737373]">
                <th className="px-4 py-2 font-medium text-xs">Domain</th>
                <th className="px-4 py-2 font-medium text-xs">Funnel</th>
                <th className="px-4 py-2 font-medium text-xs">Vercel</th>
                <th className="px-4 py-2 font-medium text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {domains?.domains.map((d) => (
                <tr key={d.funnelId} className="border-b border-[#EBEBEB] last:border-0">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-[#737373]" />
                      <a href={`https://${d.domain}`} target="_blank" rel="noopener noreferrer" className="text-[#2D6A4F] hover:underline font-mono text-xs">
                        {d.domain}
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-xs text-[#737373]">
                    <Link href={`/builder/${d.funnelId}`} className="hover:underline">
                      {d.funnelName}
                    </Link>
                    <span className="text-[10px] text-[#999999] ml-1">/{d.slug}</span>
                  </td>
                  <td className="px-4 py-2">
                    {d.registeredInVercel ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-600">
                        <CheckCircle className="w-3 h-3" /> Registered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-500">
                        <XCircle className="w-3 h-3" /> Not registered
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!d.registeredInVercel && (
                        <button
                          disabled={domainAction === d.domain}
                          onClick={async () => {
                            setDomainAction(d.domain);
                            try {
                              const res = await fetch("/api/admin/domains", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ action: "register", domain: d.domain }),
                              });
                              if (res.ok) {
                                setDomains(prev => prev ? {
                                  ...prev,
                                  domains: prev.domains.map(dd => dd.domain === d.domain ? { ...dd, registeredInVercel: true } : dd),
                                } : null);
                              }
                            } catch {}
                            setDomainAction(null);
                          }}
                          className="text-[10px] px-2 py-1 bg-[#2D6A4F] text-white rounded hover:bg-[#245840] transition-colors"
                        >
                          {domainAction === d.domain ? "..." : "Register"}
                        </button>
                      )}
                      <button
                        disabled={domainAction === `verify-${d.domain}`}
                        onClick={async () => {
                          setDomainAction(`verify-${d.domain}`);
                          try {
                            const res = await fetch("/api/admin/domains", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "verify", domain: d.domain }),
                            });
                            const data = await res.json();
                            if (data.verified) {
                              toast.success(`${d.domain} verified`);
                            } else {
                              toast.error(data.error || "Verification pending");
                            }
                          } catch {
                            toast.error("Verification request failed");
                          }
                          setDomainAction(null);
                        }}
                        className="text-[10px] px-2 py-1 border border-[#EBEBEB] rounded hover:bg-gray-50 transition-colors"
                      >
                        Verify
                      </button>
                      <button
                        disabled={domainAction === `remove-${d.domain}`}
                        onClick={async () => {
                          if (!confirm(`Remove ${d.domain} from Vercel?`)) return;
                          setDomainAction(`remove-${d.domain}`);
                          try {
                            await fetch("/api/admin/domains", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "remove", domain: d.domain }),
                            });
                            setDomains(prev => prev ? {
                              ...prev,
                              domains: prev.domains.map(dd => dd.domain === d.domain ? { ...dd, registeredInVercel: false } : dd),
                            } : null);
                          } catch {}
                          setDomainAction(null);
                        }}
                        className="text-[10px] px-2 py-1 text-red-500 border border-red-200 rounded hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!domains || domains.domains.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[#999999] text-xs">No custom domains configured</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
