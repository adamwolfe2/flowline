import { Skeleton } from "@/components/ui/skeleton";

export default function BuilderLoading() {
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top bar skeleton */}
      <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-4 w-px bg-gray-200" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>
      {/* Tab bar skeleton */}
      <div className="h-10 border-b border-gray-100 flex items-center gap-1 px-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <Skeleton key={i} className="h-6 w-16 rounded-md" />
        ))}
      </div>
      {/* Content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor sidebar */}
        <div className="w-[420px] border-r border-gray-100 p-4 space-y-4 hidden md:block">
          <Skeleton className="h-5 w-28 mb-3" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-5 w-32 mt-4 mb-3" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        {/* Preview pane */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-[#6B7280]">Loading builder...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
