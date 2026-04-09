import { Skeleton } from "@/components/ui/skeleton";

export default function SharedAnalyticsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Skeleton className="h-8 w-56 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl border border-[#E5E7EB] p-5">
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
