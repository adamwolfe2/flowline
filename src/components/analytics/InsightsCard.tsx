"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Info,
} from "lucide-react";
import type { InsightPayload } from "@/lib/insights/schema";

interface InsightsCardProps {
  funnelId: string;
  timeRange: string;
  userPlan: "free" | "pro" | "agency";
  isAdmin: boolean;
}

type CardState =
  | { kind: "loading" }
  | { kind: "plan_gated" }
  | { kind: "insufficient_data"; currentSessions: number; requiredSessions: number; message: string }
  | { kind: "ready"; insight: InsightPayload; generatedAt: string; stale: boolean }
  | { kind: "error"; message: string };

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color =
    label === "excellent"
      ? "#2D6A4F"
      : label === "good"
      ? "#059669"
      : label === "fair"
      ? "#D97706"
      : "#DC2626";
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-semibold"
      style={{ backgroundColor: color }}
    >
      <TrendingUp className="w-3 h-3" />
      {score}/100 &middot; {label.replace("_", " ")}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: "critical" | "high" | "medium" }) {
  const map = {
    critical: { color: "#DC2626", bg: "#FEF2F2", label: "Critical" },
    high: { color: "#D97706", bg: "#FFFBEB", label: "High" },
    medium: { color: "#2D6A4F", bg: "#F0FDF4", label: "Medium" },
  };
  const { color, bg, label } = map[severity];
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ color, backgroundColor: bg }}
    >
      {label}
    </span>
  );
}

export function InsightsCard({ funnelId, timeRange, userPlan, isAdmin }: InsightsCardProps) {
  const [state, setState] = useState<CardState>({ kind: "loading" });
  const [regenerating, setRegenerating] = useState(false);
  const autoTriggeredRef = useRef(false);

  const triggerRegenerate = useCallback(
    async (silent = false) => {
      if (!silent) setRegenerating(true);
      try {
        const res = await fetch(
          `/api/funnels/${funnelId}/insights/regenerate?timeRange=${timeRange}`,
          { method: "POST" }
        );
        const body = await res.json();

        if (res.status === 403) {
          setState({ kind: "plan_gated" });
          return;
        }
        if (res.status === 429) {
          if (!silent) toast.error("Daily insights limit reached. Try again tomorrow.");
          setState((prev) =>
            prev.kind === "loading" ? { kind: "error", message: "Daily limit reached." } : prev
          );
          return;
        }
        if (!res.ok) {
          if (body.status === "unavailable") {
            setState({ kind: "error", message: body.message ?? "Insights unavailable." });
          } else {
            setState({ kind: "error", message: "Failed to generate insights." });
          }
          return;
        }

        if (body.status === "insufficient_data") {
          setState({
            kind: "insufficient_data",
            currentSessions: body.currentSessions,
            requiredSessions: body.requiredSessions,
            message: body.message,
          });
          return;
        }

        if (body.status === "ready") {
          setState({
            kind: "ready",
            insight: body.insight as InsightPayload,
            generatedAt: body.generatedAt,
            stale: body.stale ?? false,
          });
          if (!silent) toast.success("Insights updated");
        }
      } catch {
        setState({ kind: "error", message: "Network error. Please try again." });
      } finally {
        if (!silent) setRegenerating(false);
      }
    },
    [funnelId, timeRange]
  );

  useEffect(() => {
    autoTriggeredRef.current = false;
    setState({ kind: "loading" });

    const run = async () => {
      try {
        const res = await fetch(
          `/api/funnels/${funnelId}/insights?timeRange=${timeRange}`
        );
        const body = await res.json();

        if (res.status === 403) {
          setState({ kind: "plan_gated" });
          return;
        }

        if (!res.ok) {
          setState({ kind: "error", message: body.error ?? "Failed to load insights." });
          return;
        }

        if (body.status === "ready") {
          setState({
            kind: "ready",
            insight: body.insight as InsightPayload,
            generatedAt: body.generatedAt,
            stale: body.stale ?? false,
          });
          return;
        }

        if (body.status === "needs_generation" && !autoTriggeredRef.current) {
          autoTriggeredRef.current = true;
          await triggerRegenerate(true);
        }
      } catch {
        setState({ kind: "error", message: "Network error. Please try again." });
      }
    };

    run();
  }, [funnelId, timeRange, triggerRegenerate]);

  // ---- Plan gated ----
  if (state.kind === "plan_gated") {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col items-center text-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Lock className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Upgrade to unlock AI Insights</p>
          <p className="text-xs text-gray-500 mt-1">
            Get specific recommendations on what to fix, what is working, and expected conversion lifts.
          </p>
        </div>
        <a
          href="/billing"
          className="text-xs font-medium px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: "#2D6A4F" }}
        >
          Upgrade to Pro
        </a>
      </div>
    );
  }

  // ---- Loading ----
  if (state.kind === "loading") {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#2D6A4F] animate-pulse" />
          <span className="text-sm font-medium text-gray-600">Analyzing your funnel...</span>
        </div>
        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ---- Insufficient data ----
  if (state.kind === "insufficient_data") {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#2D6A4F]" />
          <span className="text-sm font-semibold text-gray-900">AI Insights</span>
        </div>
        <p className="text-sm text-gray-600">{state.message}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-2 rounded-full"
              style={{
                backgroundColor: "#2D6A4F",
                width: `${Math.min(100, Math.round((state.currentSessions / state.requiredSessions) * 100))}%`,
              }}
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {state.currentSessions} / {state.requiredSessions} sessions
          </span>
        </div>
      </div>
    );
  }

  // ---- Error ----
  if (state.kind === "error") {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">{state.message}</span>
        </div>
        <button
          onClick={() => triggerRegenerate(false)}
          className="text-xs font-medium text-[#2D6A4F] hover:underline whitespace-nowrap"
        >
          Retry
        </button>
      </div>
    );
  }

  // ---- Ready ----
  const { insight, generatedAt, stale } = state;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <span className="text-sm font-semibold text-gray-900">AI Insights</span>
          <ScoreBadge score={insight.score} label={insight.scoreLabel} />
          {stale && (
            <span className="text-xs text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded-full">
              Stale
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Generated {formatRelativeTime(generatedAt)}</span>
          <button
            onClick={() => triggerRegenerate(false)}
            disabled={regenerating}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${regenerating ? "animate-spin" : ""}`} />
            {regenerating ? "Generating..." : "Regenerate"}
          </button>
        </div>
      </div>

      {/* Headline */}
      <p className="text-sm text-gray-700 font-medium">{insight.headline}</p>

      {/* Benchmark comparison */}
      <div className="grid grid-cols-2 gap-3">
        {(["completionRate", "conversionRate"] as const).map((key) => {
          const bm = insight.benchmarkComparison[key];
          const statusColor =
            bm.status === "above" ? "#2D6A4F" : bm.status === "at" ? "#D97706" : "#DC2626";
          const label = key === "completionRate" ? "Completion Rate" : "Conversion Rate";
          return (
            <div key={key} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-gray-900">{bm.yours}%</span>
                <span className="text-xs" style={{ color: statusColor }}>
                  {bm.status === "above" ? "above" : bm.status === "at" ? "at" : "below"} benchmark ({bm.benchmark})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Wins */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          What is Working
        </h3>
        <div className="space-y-2">
          {insight.wins.map((win, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{win.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{win.detail}</p>
                {win.metric && (
                  <span className="text-xs font-medium text-[#2D6A4F] mt-1 inline-block">
                    {win.metric}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issues */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Issues to Fix
        </h3>
        <div className="space-y-3">
          {insight.issues.map((issue, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-lg p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle
                    className="w-4 h-4 shrink-0"
                    style={{
                      color:
                        issue.severity === "critical"
                          ? "#DC2626"
                          : issue.severity === "high"
                          ? "#D97706"
                          : "#2D6A4F",
                    }}
                  />
                  <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <SeverityBadge severity={issue.severity} />
                  <span className="text-xs text-gray-400">{issue.stepReference}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600">{issue.detail}</p>
              <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-2">
                <span className="text-xs font-semibold text-gray-500 shrink-0 pt-0.5">Fix:</span>
                <p className="text-xs text-gray-700">{issue.suggestion}</p>
              </div>
              <div className="flex items-center justify-end">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: "#2D6A4F" }}
                >
                  Expected lift: {issue.expectedLift}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
