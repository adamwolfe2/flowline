"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Funnel, FunnelStats } from "@/types";
import { FunnelCard } from "@/components/dashboard/FunnelCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { toast } from "sonner";
import { firePublishConfetti } from "@/lib/confetti";

interface FunnelWithStats extends Funnel {
  stats: FunnelStats;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [funnels, setFunnels] = useState<FunnelWithStats[]>([]);
  const [loading, setLoading] = useState(true);

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

  function handleDelete(id: string) {
    setFunnels(prev => prev.filter(f => f.id !== id));
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Funnels</h1>
        <p className="text-sm text-gray-500 mt-1">Create, manage, and monitor your booking funnels.</p>
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
            {funnels.map(funnel => (
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
