import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="border border-[#E5E7EB] rounded-xl p-4">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-7 w-12 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      {/* Waterfall chart */}
      <div className="border border-[#E5E7EB] rounded-xl p-6 mb-8">
        <Skeleton className="h-5 w-36 mb-4" />
        <div className="flex items-end gap-4 h-[200px]">
          {[100, 85, 70, 60, 45, 30].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
              <Skeleton className="h-3 w-8" />
              <Skeleton className={`w-full rounded-t-md`} style={{ height: `${h}%` }} />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
      {/* Bottom cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="border border-[#E5E7EB] rounded-xl p-5">
            <Skeleton className="h-4 w-28 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
