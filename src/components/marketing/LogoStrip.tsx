"use client";

const logos = [
  { src: "/integrations/calendly.svg", name: "Calendly" },
  { src: "/integrations/hubspot-svgrepo-com.svg", name: "HubSpot" },
  { src: "/integrations/salesforce.svg", name: "Salesforce" },
  { src: "/integrations/slack.svg", name: "Slack" },
  { src: "/integrations/notion.svg", name: "Notion" },
  { src: "/integrations/google-calendar.svg", name: "Google Calendar" },
  { src: "/integrations/gmail.svg", name: "Gmail" },
  { src: "/integrations/shopify.svg", name: "Shopify" },
  { src: "/integrations/meta-color.svg", name: "Meta" },
  { src: "/integrations/linkedin.svg", name: "LinkedIn" },
  { src: "/integrations/openai-svgrepo-com.svg", name: "OpenAI" },
  { src: "/integrations/google-ads-svgrepo-com.svg", name: "Google Ads" },
];

export function LogoStrip() {
  return (
    <section className="bg-white border-b border-[#E5E7EB] py-10 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        {/* Trust metrics */}
        <div className="flex items-center justify-center gap-8 md:gap-16 text-center mb-8">
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

        <p className="text-[11px] text-[#B0B0B0] text-center mb-5 uppercase tracking-widest">Integrates with your favorite tools</p>
      </div>

      {/* Infinite scrolling logo ticker — logos only */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex animate-scroll items-center">
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="shrink-0 mx-8"
              title={logo.name}
            >
              <img
                src={logo.src}
                alt={logo.name}
                className="h-8 w-auto object-contain opacity-30 hover:opacity-80 transition-opacity duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
