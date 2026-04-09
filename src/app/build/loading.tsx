import { Skeleton } from "@/components/ui/skeleton";

export default function BuildLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="h-14 border-b border-[#E5E7EB] flex items-center justify-between px-4 md:px-6">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full md:w-[480px] border-r border-[#E5E7EB] p-8 space-y-4">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="hidden md:flex flex-1 bg-gray-50 items-center justify-center">
          <Skeleton className="w-80 h-[600px] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
