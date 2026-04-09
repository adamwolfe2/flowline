import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Skeleton className="h-4 w-20 mb-6" />
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border border-[#E5E7EB] p-5">
            <Skeleton className="h-4 w-28 mb-4" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
