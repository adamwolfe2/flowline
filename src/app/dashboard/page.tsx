"use client";

import { useEffect, useState } from "react";
import { Funnel, FunnelStats } from "@/types";
import { FunnelCard } from "@/components/dashboard/FunnelCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface FunnelWithStats extends Funnel {
  stats: FunnelStats;
}

export default function DashboardPage() {
  const [funnels, setFunnels] = useState<FunnelWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/funnels")
      .then(r => r.json())
      .then(data => {
        setFunnels(data);
        setLoading(false);
      });
  }, []);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {funnels.map(funnel => (
            <FunnelCard key={funnel.id} funnel={funnel} stats={funnel.stats} />
          ))}
        </div>
      )}
    </div>
  );
}
