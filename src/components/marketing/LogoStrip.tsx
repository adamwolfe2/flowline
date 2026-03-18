"use client";

const logos = [
  { src: "/integrations/calcom.svg", name: "Cal.com" },
  { src: "/integrations/calendly.svg", name: "Calendly" },
  { src: "/integrations/zapier.svg", name: "Zapier" },
  { src: "/integrations/make.svg", name: "Make" },
  { src: "/integrations/openai-svgrepo-com.svg", name: "OpenAI" },
];

export function LogoStrip() {
  return (
    <section className="bg-white border-b border-[#E5E7EB] py-16 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        {/* Trust metrics */}
        <div className="flex items-center justify-center gap-10 md:gap-20 text-center mb-10">
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

        <p className="text-[11px] text-[#B0B0B0] text-center mb-8 uppercase tracking-widest">Integrates with your favorite tools</p>
      </div>

      {/* Infinite scrolling logo ticker — logos only */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex animate-scroll items-center">
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="shrink-0 mx-10"
              title={logo.name}
            >
              <img
                src={logo.src}
                alt={logo.name}
                className="h-8 w-auto object-contain opacity-30 hover:opacity-80 transition-opacity duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
