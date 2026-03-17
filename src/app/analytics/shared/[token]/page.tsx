"use client";

import { useState, useEffect, use } from "react";
import { BarChart3, Users, Target, TrendingUp, Clock } from "lucide-react";

interface SharedAnalytics {
  funnelName: string;
  stats: {
    totalSessions: number;
    totalLeads: number;
    completionRate: number;
    conversionRate: number;
    avgCompletionTimeSec: number;
  };
  dropoff: Array<{ stepLabel: string; visitors: number; retentionFromTop: number }>;
  tiers: Array<{ tier: string; count: number }>;
  timeSeries: Array<{ date: string; count: number }>;
}

export default function SharedAnalyticsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<SharedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/analytics/shared/${token}`)
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">This analytics link is invalid or has been revoked.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Sessions", value: data.stats.totalSessions, icon: TrendingUp },
    { label: "Total Leads", value: data.stats.totalLeads, icon: Users },
    { label: "Completion Rate", value: `${data.stats.completionRate}%`, icon: Target },
    { label: "Conversion Rate", value: `${data.stats.conversionRate}%`, icon: BarChart3 },
    { label: "Avg. Time", value: data.stats.avgCompletionTimeSec > 0 ? `${data.stats.avgCompletionTimeSec}s` : "--", icon: Clock },
  ];

  const tierColors: Record<string, string> = {
    high: "bg-emerald-100 text-emerald-700",
    mid: "bg-amber-100 text-amber-700",
    low: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Shared Analytics</p>
          <h1 className="text-2xl font-bold text-gray-900">{data.funnelName}</h1>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Dropoff waterfall */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Funnel Dropoff</h3>
          <div className="space-y-2">
            {data.dropoff.map((step) => (
              <div key={step.stepLabel} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 shrink-0">{step.stepLabel}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-[#2D6A4F] rounded-full flex items-center justify-end px-2"
                    style={{ width: `${step.retentionFromTop}%` }}
                  >
                    <span className="text-[10px] text-white font-medium">{step.visitors}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-10 text-right">{step.retentionFromTop}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier distribution */}
        {data.tiers.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Lead Quality</h3>
            <div className="flex gap-3">
              {data.tiers.map(({ tier, count }) => (
                <div key={tier} className="flex-1 text-center p-3 rounded-lg bg-gray-50">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${tierColors[tier] || tierColors.low}`}>
                    {tier.toUpperCase()}
                  </span>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <a
            href="https://getmyvsl.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
          >
            Powered by MyVSL
          </a>
        </div>
      </div>
    </div>
  );
}
