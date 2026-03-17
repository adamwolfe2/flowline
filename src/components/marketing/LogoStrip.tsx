export function LogoStrip() {
  return (
    <section className="bg-white border-b border-[#E5E7EB] py-6 px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-8 md:gap-16 text-center">
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
    </section>
  );
}
