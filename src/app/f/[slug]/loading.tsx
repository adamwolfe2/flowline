export default function FunnelLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#E5E7EB] border-t-[#2D6A4F] animate-spin" />
        <p className="text-xs text-[#9CA3AF]">Loading...</p>
      </div>
    </div>
  );
}
