export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-6">
              <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mb-3" />
              <div className="h-4 w-64 bg-gray-50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
