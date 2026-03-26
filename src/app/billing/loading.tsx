export default function BillingLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-36 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-6 h-64 animate-pulse">
              <div className="h-5 w-20 bg-gray-100 rounded mb-4" />
              <div className="h-8 w-24 bg-gray-100 rounded mb-6" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-50 rounded" />
                <div className="h-3 w-3/4 bg-gray-50 rounded" />
                <div className="h-3 w-1/2 bg-gray-50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
