import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-white p-6">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-[300px] rounded-xl mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    </div>
  );
}
