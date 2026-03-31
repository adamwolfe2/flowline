"use client";

import { useState, useEffect, use } from "react";
import {
  BarChart3,
  Users,
  Target,
  TrendingUp,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import Image from "next/image";

interface SharedAnalytics {
  funnelName: string;
  brandLogoUrl: string | null;
  brandColor: string;
  teamBranding?: {
    logoUrl: string | null;
    appName: string | null;
    primaryColor: string | null;
  };
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
  devices: Array<{ deviceType: string | null; count: number }>;
  recentLeads: Array<{
    id: string;
    email: string;
    score: number;
    calendarTier: string;
    createdAt: string;
  }>;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "--";
  }
}

function tierBadgeColor(tier: string): string {
  if (tier === "high") return "bg-[#2D6A4F]/10 text-[#2D6A4F]";
  if (tier === "mid") return "bg-[#D97706]/10 text-[#D97706]";
  return "bg-gray-100 text-gray-600";
}

function deviceIcon(type: string | null) {
  if (type === "mobile") return Smartphone;
  if (type === "tablet") return Tablet;
  return Monitor;
}

/** Validate brand color is a safe CSS color value */
function sanitizeColor(color: string): string {
  if (/^#[0-9a-fA-F]{3,8}$/.test(color)) return color;
  return "#2D6A4F";
}

export default function SharedAnalyticsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<SharedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/analytics/shared/${encodeURIComponent(token)}`)
      .then(r => {
        if (r.status === 410) throw new Error("expired");
        if (r.status === 429) throw new Error("rate_limited");
        if (!r.ok) throw new Error("not_found");
        return r.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.message === "expired") {
            setErrorMessage("This analytics link has expired. Please ask for a new link.");
          } else if (err.message === "rate_limited") {
            setErrorMessage("Too many requests. Please wait a moment and try again.");
          } else {
            setErrorMessage("This analytics link is invalid or has expired.");
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{errorMessage ?? "This analytics link is invalid or has expired."}</p>
        </div>
      </div>
    );
  }

  const teamColor = data.teamBranding?.primaryColor ? sanitizeColor(data.teamBranding.primaryColor) : null;
  const accentColor = teamColor || sanitizeColor(data.brandColor || "#2D6A4F");
  const funnelName = data.funnelName || "Funnel";
  const headerLogoUrl = data.teamBranding?.logoUrl || data.brandLogoUrl;
  const poweredByName = data.teamBranding?.appName || "MyVSL";
  const poweredByUrl = data.teamBranding?.appName ? null : "https://getmyvsl.com";

  const statCards = [
    { label: "Sessions", value: data.stats.totalSessions.toLocaleString(), icon: TrendingUp },
    { label: "Leads", value: data.stats.totalLeads.toLocaleString(), icon: Users },
    { label: "Completion Rate", value: `${data.stats.completionRate ?? 0}%`, icon: Target },
    { label: "Conversion Rate", value: `${data.stats.conversionRate ?? 0}%`, icon: BarChart3 },
    {
      label: "Avg. Time",
      value: data.stats.avgCompletionTimeSec > 0
        ? data.stats.avgCompletionTimeSec >= 60
          ? `${Math.floor(data.stats.avgCompletionTimeSec / 60)}m ${data.stats.avgCompletionTimeSec % 60}s`
          : `${data.stats.avgCompletionTimeSec}s`
        : "--",
      icon: Clock,
    },
  ];

  // Device breakdown — safe against division by zero
  const totalDevices = data.devices.reduce((s, d) => s + d.count, 0);
  const deviceMap: Record<string, number> = {};
  data.devices.forEach((d) => {
    deviceMap[d.deviceType ?? "unknown"] = d.count;
  });

  const hasNoData = data.stats.totalSessions === 0 && data.stats.totalLeads === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            {headerLogoUrl ? (
              <Image
                src={headerLogoUrl}
                alt={funnelName}
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: accentColor }}
              >
                {funnelName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{funnelName} Analytics</h1>
              <p className="text-xs text-gray-400">Last 30 days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Empty state when no data at all */}
        {hasNoData && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
            <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No traffic data yet.</p>
            <p className="text-xs text-gray-400 mt-1">Analytics will appear once the funnel receives visitors.</p>
          </div>
        )}

        {/* Dropoff waterfall */}
        {!hasNoData && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Funnel Drop-off</h3>
            {data.dropoff.length > 0 ? (
              <div className="space-y-2">
                {data.dropoff.map((step) => (
                  <div key={step.stepLabel} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 sm:w-24 shrink-0 truncate">{step.stepLabel}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center justify-end px-2 transition-all"
                        style={{ width: `${Math.max(step.retentionFromTop, 2)}%`, backgroundColor: accentColor }}
                      >
                        {step.retentionFromTop >= 10 && (
                          <span className="text-[10px] text-white font-medium">{step.visitors}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 w-10 text-right">{step.retentionFromTop}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No drop-off data yet</p>
            )}
          </div>
        )}

        {/* Device breakdown + Tier distribution row */}
        {!hasNoData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Device Breakdown */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Device Breakdown</h3>
              {totalDevices > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {(["desktop", "mobile", "tablet"] as const).map((type) => {
                    const count = deviceMap[type] ?? 0;
                    const pct = totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0;
                    const DeviceIcon = deviceIcon(type);
                    return (
                      <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                        <DeviceIcon className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-900">{pct}%</p>
                        <p className="text-[10px] text-gray-400 capitalize">{type}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No device data yet</p>
              )}
            </div>

            {/* Tier distribution */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Lead Quality</h3>
              {data.tiers.length > 0 ? (
                <div className="flex gap-3">
                  {data.tiers.map(({ tier, count }) => (
                    <div key={tier} className="flex-1 text-center p-3 rounded-lg bg-gray-50">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${tierBadgeColor(tier)}`}>
                        {tier.toUpperCase()}
                      </span>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No leads yet</p>
              )}
            </div>
          </div>
        )}

        {/* Recent Leads Table */}
        {!hasNoData && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Leads</h3>
            {data.recentLeads.length > 0 ? (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-xs min-w-[400px]">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100">
                      <th className="text-left py-2 font-medium">Email</th>
                      <th className="text-center py-2 font-medium">Score</th>
                      <th className="text-center py-2 font-medium">Tier</th>
                      <th className="text-right py-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-gray-50">
                        <td className="py-2.5 text-gray-900 font-medium max-w-[200px] truncate">{lead.email}</td>
                        <td className="py-2.5 text-center text-gray-700">{lead.score ?? "--"}</td>
                        <td className="py-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${tierBadgeColor(lead.calendarTier ?? "low")}`}>
                            {lead.calendarTier ?? "unknown"}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-gray-400">{formatDate(lead.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No leads captured yet</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#E5E7EB] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center">
          {poweredByUrl ? (
            <a
              href={poweredByUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
            >
              Powered by {poweredByName}
            </a>
          ) : (
            <span className="text-xs text-gray-400">
              Powered by {poweredByName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
