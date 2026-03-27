"use client";

import { useEffect, useState, useCallback, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Funnel, FunnelStats } from "@/types";
import { FunnelCard } from "@/components/dashboard/FunnelCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TemplateGallery } from "@/components/dashboard/TemplateGallery";
import { toast } from "sonner";
import { firePublishConfetti } from "@/lib/confetti";

interface FunnelWithStats extends Funnel {
  stats: FunnelStats;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [funnels, setFunnels] = useState<FunnelWithStats[]>([]);
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
  const claimAttempted = useRef(false);

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

      fetch("/api/funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: savedConfig, slug: savedSlug }),
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
          toast.success(`Welcome to ${planName}! Your account has been upgraded.`);
          firePublishConfetti("#2D6A4F");
        })
        .catch(() => {
          toast.success("Your account has been upgraded!");
          firePublishConfetti("#2D6A4F");
        });
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  const loadFunnels = useCallback(() => {
    fetch("/api/funnels")
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
  }, []);

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

  const filteredFunnels = useMemo(() => {
    let result = [...funnels];

    // Status filter
    if (statusFilter === "published") result = result.filter(f => f.published);
    if (statusFilter === "draft") result = result.filter(f => !f.published);

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "leads":
        result.sort((a, b) => (b.stats?.leadsThisMonth ?? 0) - (a.stats?.leadsThisMonth ?? 0));
        break;
      case "views":
        result.sort((a, b) => (b.stats?.totalSessions ?? 0) - (a.stats?.totalSessions ?? 0));
        break;
      case "az":
        result.sort((a, b) => a.config.brand.name.localeCompare(b.config.brand.name));
        break;
    }

    return result;
  }, [funnels, sortBy, statusFilter]);

  function handleDelete(id: string) {
    setFunnels(prev => prev.filter(f => f.id !== id));
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Funnels</h1>
        <p className="text-sm text-gray-500 mt-1">Create, manage, and monitor your booking funnels.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
        <TemplateGallery onCreated={loadFunnels} />
        {!loading && funnels.length > 0 && (
          <>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-colors min-h-[44px]"
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
              className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-colors min-h-[44px]"
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
        <EmptyState />
      ) : (
        <ErrorBoundary>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFunnels.map(funnel => (
              <FunnelCard
                key={funnel.id}
                funnel={funnel}
                stats={funnel.stats}
                onDelete={handleDelete}
                onDuplicate={loadFunnels}
              />
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
