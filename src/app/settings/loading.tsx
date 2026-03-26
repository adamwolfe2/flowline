import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl px-6 py-8">
      <Skeleton className="h-8 w-32 mb-1.5" />
      <Skeleton className="h-4 w-64 mb-8" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-3">
            <div>
              <Skeleton className="h-3 w-12 mb-1.5" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}
