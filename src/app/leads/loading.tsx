import { Skeleton } from "@/components/ui/skeleton";

export default function LeadsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-7 w-24 mb-1.5" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Skeleton className="h-10 w-56 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 flex gap-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[#E5E7EB] last:border-b-0">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-4 w-20 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
