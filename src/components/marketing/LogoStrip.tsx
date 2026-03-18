const industries = ["Coaches", "SaaS", "Agencies", "Real Estate", "Fitness"];

export function LogoStrip() {
  return (
    <section className="bg-white border-b border-[#E5E7EB] py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Trust metrics */}
        <div className="flex items-center justify-center gap-8 md:gap-16 text-center mb-6">
          <div>
            <p className="text-2xl font-bold text-[#111827]">500+</p>
            <p className="text-xs text-[#6B7280]">Businesses live</p>
          </div>
          <div className="w-px h-8 bg-[#E5E7EB]" />
          <div>
            <p className="text-2xl font-bold text-[#111827]">12,000+</p>
            <p className="text-xs text-[#6B7280]">Calls booked</p>
          </div>
          <div className="w-px h-8 bg-[#E5E7EB]" />
          <div>
            <p className="text-2xl font-bold text-[#111827]">2 min</p>
            <p className="text-xs text-[#6B7280]">Average setup time</p>
          </div>
        </div>

        {/* Industry badges */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-[#9CA3AF]">Trusted by</span>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {industries.map((industry) => (
              <span
                key={industry}
                className="text-xs font-medium text-[#6B7280] bg-[#F9FAFB] border border-[#E5E7EB] rounded-full px-3 py-1"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
