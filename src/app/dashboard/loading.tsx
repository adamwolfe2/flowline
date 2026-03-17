import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-[220px] rounded-xl" />)}
      </div>
    </div>
  );
}
