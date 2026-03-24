"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  const [funnels, setFunnels] = useState<FunnelWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      toast.success("Welcome to Pro! Your account has been upgraded.");
      firePublishConfetti();
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

      <TemplateGallery onCreated={loadFunnels} />

      {!loading && funnels.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-colors"
          >
            <option value="newest">Newest</option>
            <option value="leads">Most leads</option>
            <option value="views">Most views</option>
            <option value="az">A-Z</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-colors"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      )}

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
