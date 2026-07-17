"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Funnel, FunnelStats } from "@/types";
import { FunnelCard } from "@/components/dashboard/FunnelCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TemplateGallery, TemplateGalleryRef } from "@/components/dashboard/TemplateGallery";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { toast } from "sonner";
import { firePublishConfetti } from "@/lib/confetti";
import { useLeadNotifications } from "@/hooks/useLeadNotifications";
import { useWorkspace, workspaceFetch } from "@/hooks/useWorkspace";

interface FunnelWithStats extends Funnel {
  stats: FunnelStats;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [funnels, setFunnels] = useState<FunnelWithStats[]>([]);
  const templateGalleryRef = useRef<TemplateGalleryRef>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("myvsl_dashboard_sort") || "newest";
    }
    return "newest";
  });
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("myvsl_dashboard_status") || "all";
    }
    return "all";
  });
  // Landing-page vs quiz-funnel view. Filtered client-side so it composes with
  // the server-side sort/status without an extra round-trip.
  const [typeFilter, setTypeFilter] = useState<"all" | "landing" | "quiz">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("myvsl_dashboard_type");
      if (saved === "landing" || saved === "quiz") return saved;
    }
    return "all";
  });
  const claimAttempted = useRef(false);
  const { isTeamContext, activeTeam } = useWorkspace();

  // Poll for new leads and show toast notifications
  useLeadNotifications(!loading && funnels.length > 0);

  // Claim pending funnel from localStorage (saved before sign-up)
  useEffect(() => {
    if (claimAttempted.current) return;
    claimAttempted.current = true;

    const pending = localStorage.getItem("myvsl_pending_funnel");
    if (!pending) return;

    try {
      const { config: savedConfig, slug: savedSlug } = JSON.parse(pending);
      if (!savedConfig?.brand || !savedConfig?.quiz) {
        localStorage.removeItem("myvsl_pending_funnel");
        return;
      }

      workspaceFetch("/api/funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: savedConfig, slug: savedSlug, creationSource: 'ai' }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            if (res.status === 403) {
              toast.error("You've reached your free plan limit. Upgrade to Pro for unlimited funnels.", {
                action: { label: "Upgrade", onClick: () => router.push("/billing") },
                duration: 6000,
              });
            } else {
              toast.error(data.error || "Failed to save your funnel.");
            }
            localStorage.removeItem("myvsl_pending_funnel");
            return;
          }
          const funnel = await res.json();
          localStorage.removeItem("myvsl_pending_funnel");
          toast.success("Your funnel was saved!");
          router.push(`/builder/${funnel.id}`);
        })
        .catch(() => {
          localStorage.removeItem("myvsl_pending_funnel");
          toast.error("Failed to save your funnel. Please try again.");
        });
    } catch {
      localStorage.removeItem("myvsl_pending_funnel");
    }
  }, [router]);

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      fetch("/api/user")
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          const planName = data?.plan
            ? data.plan.charAt(0).toUpperCase() + data.plan.slice(1)
            : "Pro";
          toast.success(`Welcome to ${planName}!`, {
            description: "Your account has been upgraded. All features are now unlocked.",
            duration: 6000,
          });
          firePublishConfetti("#0A9AFF");
        })
        .catch(() => {
          toast.success("Your account has been upgraded!", {
            description: "All features are now unlocked.",
            duration: 6000,
          });
          firePublishConfetti("#0A9AFF");
        });
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  const loadFunnels = useCallback(() => {
    const params = new URLSearchParams({ sort: sortBy, status: statusFilter });
    workspaceFetch(`/api/funnels?${params.toString()}`)
      .then(r => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(data => {
        setFunnels(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Failed to load funnels. Please refresh.");
      });
  }, [sortBy, statusFilter]);

  useEffect(() => {
    loadFunnels();
  }, [loadFunnels]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        loadFunnels();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [loadFunnels]);

  // Persist sort and filter preferences
  useEffect(() => {
    localStorage.setItem("myvsl_dashboard_sort", sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem("myvsl_dashboard_status", statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    localStorage.setItem("myvsl_dashboard_type", typeFilter);
  }, [typeFilter]);

  // Sort/status are handled server-side; the landing-vs-quiz split is applied
  // here. The DB column is authoritative; fall back to config.type for any
  // legacy row the API doesn't stamp.
  const isLanding = (f: FunnelWithStats) => (f.type ?? f.config?.type) === "landing";
  const landingCount = funnels.filter(isLanding).length;
  const quizCount = funnels.length - landingCount;
  const visibleFunnels =
    typeFilter === "all"
      ? funnels
      : funnels.filter((f) => (typeFilter === "landing" ? isLanding(f) : !isLanding(f)));

  function handleDelete(id: string) {
    setFunnels(prev => prev.filter(f => f.id !== id));
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
          {isTeamContext && activeTeam ? activeTeam.name : "Your Funnels"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isTeamContext && activeTeam
            ? `Manage funnels for ${activeTeam.name}.`
            : "Create, manage, and monitor your booking funnels."}
        </p>
      </motion.div>

      {!loading && (
        <OnboardingChecklist
          hasFunnel={funnels.length > 0}
          hasPublished={funnels.some(f => f.published)}
          hasLead={funnels.some(f => (f.stats?.leadsThisMonth ?? 0) > 0)}
          hasCustomBrand={funnels.some(f => f.config?.brand?.logoUrl?.trim())}
          hasCalendar={funnels.some(f => f.config?.quiz?.calendars?.high?.trim() || f.config?.quiz?.calendars?.mid?.trim() || f.config?.quiz?.calendars?.low?.trim())}
        />
      )}

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
        <TemplateGallery ref={templateGalleryRef} onCreated={loadFunnels} />
        {!loading && funnels.length > 0 && (
          <>
            <div
              className="inline-flex items-center rounded-[10px] border border-black/[0.08] bg-white p-0.5 min-h-[44px]"
              role="tablist"
              aria-label="Filter by page type"
            >
              {([
                ["all", "All", funnels.length],
                ["landing", "Landing Pages", landingCount],
                ["quiz", "Funnels", quizCount],
              ] as const).map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={typeFilter === value}
                  onClick={() => setTypeFilter(value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-[8px] transition-colors ${
                    typeFilter === value
                      ? "bg-[#0A9AFF] text-white"
                      : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  {label}
                  <span className={`ml-1.5 ${typeFilter === value ? "text-white/70" : "text-[#9CA3AF]"}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm border border-black/[0.08] rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A9AFF]/20 focus:border-[#0A9AFF] transition-colors min-h-[44px]"
              aria-label="Sort funnels"
            >
              <option value="newest">Newest</option>
              <option value="leads">Most leads</option>
              <option value="views">Most views</option>
              <option value="az">A-Z</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-black/[0.08] rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A9AFF]/20 focus:border-[#0A9AFF] transition-colors min-h-[44px]"
              aria-label="Filter by status"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-[220px] rounded-xl" />
          ))}
        </div>
      ) : funnels.length === 0 ? (
        <EmptyState onOpenTemplates={() => templateGalleryRef.current?.open()} />
      ) : visibleFunnels.length === 0 ? (
        <div className="text-center py-16 text-[#6B7280]">
          <p className="text-sm">
            No {typeFilter === "landing" ? "landing pages" : "funnels"} yet.
          </p>
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className="mt-2 text-sm font-medium text-[#0A9AFF] hover:underline"
          >
            Show all
          </button>
        </div>
      ) : (
        <ErrorBoundary>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleFunnels.map((funnel, index) => (
              <motion.div
                key={funnel.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <FunnelCard
                  funnel={funnel}
                  stats={funnel.stats}
                  onDelete={handleDelete}
                  onDuplicate={loadFunnels}
                />
              </motion.div>
            ))}
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-[220px] rounded-xl" />
        ))}
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
