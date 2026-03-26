"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  Download,
  Eye,
  Users,
  Target,
  Clock,
  BarChart3,
  Smartphone,
  Monitor,
  Tablet,
  ChevronLeft,
  ChevronRight,
  Share2,
  Link2,
  Link2Off,
  Check,
  X,
  Mail,
  Send,
  Copy,
} from "lucide-react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LeadDetailModal } from "@/components/analytics/LeadDetailModal";

const LeadsChart = dynamic(
  () => import("@/components/analytics/LeadsChart").then((m) => m.LeadsChart),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />,
  }
);

const WaterfallChart = dynamic(
  () => import("@/components/analytics/WaterfallChart").then((m) => m.WaterfallChart),
  {
    ssr: false,
    loading: () => <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />,
  }
);

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AnalyticsData {
  funnel: {
    id: string;
    slug: string;
    config: { brand: { name: string; primaryColor: string } };
    published: boolean;
  };
  stats: {
    totalSessions: number;
    totalLeads: number;
    completionRate: number;
    conversionRate: number;
    avgCompletionTimeSec: number;
  };
  dropoff: Array<{
    stepIndex: number;
    stepLabel: string;
    visitors: number;
    dropoffFromPrev: number;
    retentionFromTop: number;
  }>;
  answers: Record<string, Array<{ answerId: string | null; answerLabel: string | null; count: number }>>;
  abandons: Array<{ stepIndex: number; stepLabel: string; abandonCount: number }>;
  devices: Array<{ deviceType: string | null; count: number }>;
  utmSources: Array<{ utmSource: string | null; count: number }>;
  tiers: Array<{ tier: string | null; count: number }>;
  timeSeries: Array<{ date: string; count: number }>;
  variantPerformance: Array<{
    variantId: string;
    variantName: string;
    isControl: boolean;
    trafficWeight: number;
    sessions: number;
    completions: number;
    conversions: number;
    completionRate: number;
    conversionRate: number;
    avgScore: number;
  }>;
  totalLeadCount: number;
  recentLeads: Array<{
    id: string;
    email: string;
    score: number;
    calendarTier: string;
    deviceType: string | null;
    utmSource: string | null;
    createdAt: string;
  }>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon: Icon,
  suffix,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-gray-400">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {value}
        {suffix && <span className="text-sm font-normal text-gray-400 ml-0.5">{suffix}</span>}
      </p>
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className ?? ""}`} />;
}

function tierBadgeColor(tier: string) {
  if (tier === "high") return "bg-[#2D6A4F]/10 text-[#2D6A4F]";
  if (tier === "mid") return "bg-[#D97706]/10 text-[#D97706]";
  return "bg-gray-100 text-gray-600";
}

function deviceIcon(type: string | null) {
  if (type === "mobile") return Smartphone;
  if (type === "tablet") return Tablet;
  return Monitor;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function downloadCSV(leadRows: AnalyticsData["recentLeads"], funnelSlug: string) {
  const header = "Email,Score,Tier,Device,UTM Source,Date";
  const rows = leadRows.map(
    (l) =>
      `${l.email},${l.score},${l.calendarTier},${l.deviceType ?? ""},${l.utmSource ?? ""},${l.createdAt}`
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${funnelSlug}-leads.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AnalyticsDashboard() {
  const { funnelId } = useParams<{ funnelId: string }>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leadsPage, setLeadsPage] = useState(0);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareClientEmail, setShareClientEmail] = useState<string>("");
  const [shareDailyDigest, setShareDailyDigest] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  const handleGenerateShareToken = async () => {
    setSharing(true);
    try {
      const res = await fetch(`/api/funnels/${funnelId}/share`, { method: "POST" });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setShareToken(result.shareToken);
      setShareClientEmail(result.shareClientEmail ?? "");
      setShareDailyDigest(result.shareDailyDigest ?? false);
      setShareModalOpen(true);
    } catch {
      toast.error("Failed to generate share link");
    } finally {
      setSharing(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/analytics/shared/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied to clipboard");
  };

  const handleUpdateShareSettings = async () => {
    try {
      const res = await fetch(`/api/funnels/${funnelId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientEmail: shareClientEmail || undefined,
          dailyDigest: shareDailyDigest,
        }),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setShareToken(result.shareToken);
      toast.success("Share settings updated");
    } catch {
      toast.error("Failed to update settings");
    }
  };

  const handleSendInvite = async () => {
    if (!shareClientEmail) {
      toast.error("Enter a client email first");
      return;
    }
    setSendingInvite(true);
    try {
      const res = await fetch(`/api/funnels/${funnelId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientEmail: shareClientEmail,
          dailyDigest: shareDailyDigest,
          sendInvite: true,
        }),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setShareToken(result.shareToken);
      toast.success(`Invite sent to ${shareClientEmail}`);
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRevokeShare = async () => {
    try {
      await fetch(`/api/funnels/${funnelId}/share`, { method: "DELETE" });
      setShareToken(null);
      setShareClientEmail("");
      setShareDailyDigest(false);
      setShareModalOpen(false);
      toast.success("Share link revoked");
    } catch {
      toast.error("Failed to revoke link");
    }
  };

  const fetchData = useCallback(async (page = 0, range: string = timeRange) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/${funnelId}?leadsPage=${page}&timeRange=${range}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load analytics");
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [funnelId, timeRange]);

  useEffect(() => {
    fetchData(leadsPage, timeRange);
  }, [fetchData, leadsPage, timeRange]);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <SkeletonBlock className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-24" />
            ))}
          </div>
          <SkeletonBlock className="h-80" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <BarChart3 className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-500">{error ?? "No data available"}</p>
          <Link href="/dashboard" className="text-indigo-600 text-sm hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { stats, dropoff, answers, abandons, devices, utmSources, timeSeries, recentLeads, totalLeadCount, funnel, variantPerformance } = data;
  const leadsPerPage = 25;
  const totalLeadPages = Math.max(1, Math.ceil(totalLeadCount / leadsPerPage));

  /* ---------- Device helpers ---------- */
  const totalDevices = devices.reduce((s, d) => s + d.count, 0) || 1;
  const deviceMap: Record<string, number> = {};
  devices.forEach((d) => {
    deviceMap[d.deviceType ?? "unknown"] = d.count;
  });

  /* ---------- Abandon helpers ---------- */
  const maxAbandon = Math.max(...abandons.map((a) => a.abandonCount), 1);

  /* ---------- Answer helpers ---------- */
  const answerKeys = Object.keys(answers);

  /* ---------- Zero traffic state ---------- */
  if (stats.totalSessions === 0) {
    const funnelConfig = funnel?.config as { brand?: { name?: string } } | undefined;
    const funnelSlug = (funnel as Record<string, unknown>)?.slug as string;
    const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "getmyvsl.com";
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100 px-6 lg:px-10 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </Link>
            <h1 className="text-sm font-semibold text-gray-900">
              {funnelConfig?.brand?.name || "Funnel"} Analytics
            </h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-16 h-16 bg-[#2D6A4F]/10 rounded-2xl flex items-center justify-center mb-5">
            <BarChart3 className="w-8 h-8 text-[#2D6A4F]" />
          </div>
          <h2 className="text-lg font-semibold text-[#111827] mb-2">Waiting for your first visitor</h2>
          <p className="text-sm text-[#9CA3AF] max-w-md mb-6">
            Share your funnel URL to start seeing analytics data. Traffic, conversions, and lead data will appear here in real time.
          </p>
          {funnelSlug && (
            <div className="flex items-center gap-2 mb-4">
              <code className="text-xs font-mono bg-[#F3F4F6] text-[#374151] px-3 py-2 rounded-lg">
                {platformDomain}/f/{funnelSlug}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://${platformDomain}/f/${funnelSlug}`);
                  toast.success("URL copied");
                }}
                className="text-xs bg-[#2D6A4F] text-white px-3 py-2 rounded-lg hover:bg-[#245840] transition-colors"
              >
                Copy URL
              </button>
            </div>
          )}
          <Link href="/dashboard" className="text-sm text-[#2D6A4F] hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---- Header ---- */}
      <div className="bg-white border-b border-gray-100 px-6 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </Link>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: funnel.config.brand.primaryColor }}
            >
              {funnel.config.brand.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{funnel.config.brand.name}</h1>
              <p className="text-xs text-gray-400">{funnel.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={shareToken ? () => setShareModalOpen(true) : handleGenerateShareToken}
              disabled={sharing}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {shareToken ? (
                <>
                  <Link2 className="w-3 h-3 text-[#2D6A4F]" />
                  <span className="text-[#2D6A4F]">Shared</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3 h-3" />
                  Share
                </>
              )}
            </button>
            {funnel.published && (
              <a href={`/f/${funnel.slug}`} target="_blank" rel="noopener noreferrer">
                <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  View live
                </button>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-8">
        {/* ---- Time Range Selector ---- */}
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-[#2D6A4F] text-white'
                  : 'bg-[#FBFBFB] text-[#737373] hover:bg-[#F0F0F0] border border-[#EBEBEB]'
              }`}
            >
              {range === 'all' ? 'All time' : range}
            </button>
          ))}
        </div>

        {/* ---- Stats Bar ---- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Sessions" value={stats.totalSessions.toLocaleString()} icon={Eye} />
          <StatCard label="Completion" value={stats.completionRate} icon={Target} suffix="%" />
          <StatCard label="Conversion" value={stats.conversionRate} icon={BarChart3} suffix="%" />
          <StatCard
            label="Avg. Time"
            value={
              stats.avgCompletionTimeSec > 0
                ? stats.avgCompletionTimeSec >= 60
                  ? `${Math.floor(stats.avgCompletionTimeSec / 60)}m ${stats.avgCompletionTimeSec % 60}s`
                  : `${stats.avgCompletionTimeSec}s`
                : "--"
            }
            icon={Clock}
          />
          <StatCard label="Leads" value={stats.totalLeads.toLocaleString()} icon={Users} />
        </div>

        {/* ---- Waterfall Chart ---- */}
        <ErrorBoundary>
          <div className="bg-white rounded-xl border border-gray-100 p-6 overflow-x-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Funnel Drop-off</h3>
            <WaterfallChart steps={dropoff} />
          </div>
        </ErrorBoundary>

        {/* ---- Answer Distribution ---- */}
        {answerKeys.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Answer Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {answerKeys.map((qKey) => {
                const opts = answers[qKey];
                const maxCount = Math.max(...opts.map((o) => o.count), 1);
                const totalCount = opts.reduce((s, o) => s + o.count, 0) || 1;
                return (
                  <div key={qKey} className="bg-white rounded-xl border border-gray-100 p-5">
                    <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">{qKey}</p>
                    <div className="space-y-2.5">
                      {opts.map((opt) => {
                        const pct = Math.round((opt.count / totalCount) * 100);
                        return (
                          <div key={opt.answerId ?? opt.answerLabel}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-700 truncate max-w-[60%]">
                                {opt.answerLabel ?? opt.answerId ?? "Unknown"}
                              </span>
                              <span className="text-xs text-gray-400">
                                {opt.count} ({pct}%)
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full transition-all"
                                style={{ width: `${(opt.count / maxCount) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- Abandon + Device + UTM ---- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Abandon Heatmap */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Abandon Heatmap</h3>
            {abandons.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No abandon data yet</p>
            ) : (
              <div className="space-y-3">
                {abandons.map((a) => (
                  <div key={a.stepIndex}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{a.stepLabel}</span>
                      <span className="text-xs font-medium text-gray-900">{a.abandonCount}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(a.abandonCount / maxAbandon) * 100}%`,
                          backgroundColor: a.abandonCount === maxAbandon ? "#F59E0B" : "#6366F1",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Device + UTM */}
          <div className="space-y-6">
            {/* Device Breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Device Breakdown</h3>
              {devices.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No device data yet</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {(["desktop", "mobile", "tablet"] as const).map((type) => {
                    const count = deviceMap[type] ?? 0;
                    const pct = Math.round((count / totalDevices) * 100);
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
              )}
            </div>

            {/* UTM Sources */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Sources</h3>
              {utmSources.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No UTM data yet</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100">
                      <th className="text-left py-2 font-medium">Source</th>
                      <th className="text-right py-2 font-medium">Leads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utmSources.map((u) => (
                      <tr key={u.utmSource} className="border-b border-gray-50">
                        <td className="py-2 text-gray-700">{u.utmSource}</td>
                        <td className="py-2 text-right text-gray-900 font-medium">{u.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ---- Variant Performance (A/B Tests) ---- */}
        {variantPerformance && variantPerformance.length > 0 && (() => {
          const MIN_SAMPLE_SIZE = 30;
          const eligible = variantPerformance.filter(v => v.sessions >= MIN_SAMPLE_SIZE);
          const winner = eligible.length > 1
            ? eligible.reduce((best, v) => v.conversionRate > best.conversionRate ? v : best)
            : null;

          return (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">A/B Test Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100">
                      <th className="text-left py-2 font-medium">Variant</th>
                      <th className="text-center py-2 font-medium">Traffic</th>
                      <th className="text-center py-2 font-medium">Sessions</th>
                      <th className="text-center py-2 font-medium">Completions</th>
                      <th className="text-center py-2 font-medium">Completion %</th>
                      <th className="text-center py-2 font-medium">Conversions</th>
                      <th className="text-center py-2 font-medium">Conversion %</th>
                      <th className="text-center py-2 font-medium">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantPerformance.map((v) => (
                      <tr key={v.variantId} className="border-b border-gray-50">
                        <td className="py-2.5 text-gray-900 font-medium">
                          <span className="flex items-center gap-1.5">
                            {v.variantName}
                            {v.isControl && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Control</span>
                            )}
                            {winner && winner.variantId === v.variantId && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] font-medium">Winner</span>
                            )}
                          </span>
                        </td>
                        <td className="py-2.5 text-center text-gray-500">{v.trafficWeight}%</td>
                        <td className="py-2.5 text-center text-gray-700">{v.sessions}</td>
                        <td className="py-2.5 text-center text-gray-700">{v.completions}</td>
                        <td className="py-2.5 text-center text-gray-700">{v.completionRate}%</td>
                        <td className="py-2.5 text-center text-gray-700">{v.conversions}</td>
                        <td className="py-2.5 text-center font-medium text-gray-900">{v.conversionRate}%</td>
                        <td className="py-2.5 text-center text-gray-700">{v.avgScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {eligible.length < 2 && (
                <p className="text-[11px] text-gray-400 mt-3">
                  Need at least {MIN_SAMPLE_SIZE} sessions per variant to determine a winner.
                </p>
              )}
            </div>
          );
        })()}

        {/* ---- Leads Time Series ---- */}
        <ErrorBoundary>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Leads ({timeRange === 'all' ? 'All Time' : `Last ${timeRange}`})</h3>
            <LeadsChart data={timeSeries} timeRange={timeRange} />
          </div>
        </ErrorBoundary>

        {/* ---- Leads Table ---- */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Leads</h3>
            {recentLeads.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadCSV(recentLeads, funnel.slug)}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Export Page
                </button>
                <a
                  href={`/api/analytics/${funnelId}/export?timeRange=${timeRange}`}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Export All ({totalLeadCount})
                </a>
              </div>
            )}
          </div>

          {recentLeads.length === 0 && totalLeadCount === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No leads captured yet</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100">
                      <th className="text-left py-2 font-medium">Email</th>
                      <th className="text-center py-2 font-medium">Score</th>
                      <th className="text-center py-2 font-medium">Tier</th>
                      <th className="text-center py-2 font-medium">Device</th>
                      <th className="text-left py-2 font-medium">Source</th>
                      <th className="text-right py-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => setSelectedLeadId(lead.id)}>
                        <td className="py-2.5 text-gray-900 font-medium max-w-[200px] truncate">{lead.email}</td>
                        <td className="py-2.5 text-center text-gray-700">{lead.score}</td>
                        <td className="py-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${tierBadgeColor(lead.calendarTier)}`}
                          >
                            {lead.calendarTier}
                          </span>
                        </td>
                        <td className="py-2.5 text-center text-gray-500 capitalize">{lead.deviceType ?? "--"}</td>
                        <td className="py-2.5 text-gray-500">{lead.utmSource ?? "--"}</td>
                        <td className="py-2.5 text-right text-gray-400">{formatDate(lead.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Showing {leadsPage * leadsPerPage + 1}–{Math.min((leadsPage + 1) * leadsPerPage, totalLeadCount)} of {totalLeadCount}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLeadsPage((p) => Math.max(0, p - 1))}
                    disabled={leadsPage === 0}
                    className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Prev
                  </button>
                  <span className="text-xs text-gray-500">
                    Page {leadsPage + 1} of {totalLeadPages}
                  </span>
                  <button
                    onClick={() => setLeadsPage((p) => Math.min(totalLeadPages - 1, p + 1))}
                    disabled={leadsPage >= totalLeadPages - 1}
                    className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <LeadDetailModal leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShareModalOpen(false)}>
          <div
            className="bg-white rounded-xl border border-[#E5E7EB] shadow-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-sm font-semibold text-gray-900">Share Analytics</h2>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Shareable link */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Shareable Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareToken ? `${window.location.origin}/analytics/shared/${shareToken}` : ""}
                    className="flex-1 text-xs bg-gray-50 border border-[#E5E7EB] rounded-lg px-3 py-2 text-gray-600 truncate"
                  />
                  <button
                    onClick={handleCopyShareLink}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-[#E5E7EB] text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-[#2D6A4F]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Client email */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Client Email (optional)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={shareClientEmail}
                      onChange={(e) => setShareClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full text-xs border border-[#E5E7EB] rounded-lg pl-9 pr-3 py-2 text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Used for daily digest and invite emails</p>
              </div>

              {/* Daily digest toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700">Send daily report</p>
                  <p className="text-[10px] text-gray-400">Email daily stats to the client</p>
                </div>
                <button
                  onClick={() => {
                    const next = !shareDailyDigest;
                    setShareDailyDigest(next);
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    shareDailyDigest ? "bg-[#2D6A4F]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                      shareDailyDigest ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Save + Send invite */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleUpdateShareSettings}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-[#E5E7EB] text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Save Settings
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={!shareClientEmail || sendingInvite}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-[#2D6A4F] text-white hover:bg-[#245840] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3 h-3" />
                  {sendingInvite ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-3 border-t border-[#E5E7EB] flex justify-end">
              <button
                onClick={handleRevokeShare}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <Link2Off className="w-3 h-3" />
                Revoke link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
