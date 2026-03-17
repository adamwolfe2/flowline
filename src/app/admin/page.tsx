"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Layers, Mail, CalendarDays, MousePointerClick, Activity } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalFunnels: number;
  publishedFunnels: number;
  totalLeads: number;
  totalSessions: number;
  totalEvents: number;
  leadsToday: number;
  leadsThisWeek: number;
  sessionsToday: number;
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

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users },
    { label: "Funnels", value: `${stats.publishedFunnels} / ${stats.totalFunnels}`, sub: "published / total", icon: Layers },
    { label: "Total Leads", value: stats.totalLeads, icon: Mail },
    { label: "Leads Today", value: stats.leadsToday, sub: `${stats.leadsThisWeek} this week`, icon: CalendarDays },
    { label: "Sessions", value: stats.totalSessions, sub: `${stats.sessionsToday} today`, icon: Activity },
    { label: "Total Events", value: stats.totalEvents, icon: MousePointerClick },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-semibold text-[#333333]">Platform Overview</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
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
    </div>
  );
}
