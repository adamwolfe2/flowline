import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border border-[#E5E7EB] overflow-hidden">
            {/* Card header */}
            <div className="p-5 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-28 mb-1.5" />
                  <Skeleton className="h-3 w-16 rounded-full" />
                </div>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Skeleton className="h-3 w-10 mb-1" />
                  <Skeleton className="h-5 w-8" />
                </div>
                <div>
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-5 w-6" />
                </div>
                <div>
                  <Skeleton className="h-3 w-14 mb-1" />
                  <Skeleton className="h-5 w-10" />
                </div>
              </div>
            </div>
            {/* Card actions */}
            <div className="border-t border-[#E5E7EB] px-5 py-3 flex gap-2">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
