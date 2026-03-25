"use client";

import Image from "next/image";

const logos = [
  { src: "/integrations/calendly.svg", name: "Calendly" },
  { src: "/integrations/zapier.svg", name: "Zapier" },
  { src: "/integrations/make.svg", name: "Make" },
  { src: "/integrations/openai-svgrepo-com.svg", name: "OpenAI" },
  { src: "/integrations/hubspot-svgrepo-com.svg", name: "HubSpot" },
  { src: "/integrations/slack.svg", name: "Slack" },
  { src: "/integrations/notion.svg", name: "Notion" },
  { src: "/integrations/google-calendar.svg", name: "Google Calendar" },
  { src: "/integrations/gmail.svg", name: "Gmail" },
  { src: "/integrations/shopify.svg", name: "Shopify" },
  { src: "/integrations/linkedin.svg", name: "LinkedIn" },
  { src: "/integrations/salesforce.svg", name: "Salesforce" },
];

export function LogoStrip() {
  return (
    <section className="bg-white border-b border-[#E5E7EB] py-10 md:py-16 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Value props */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 md:gap-20 text-center mb-8 sm:mb-10">
          <div>
            <p className="text-sm font-semibold text-[#111827]">No Code Required</p>
            <p className="text-xs text-[#6B7280]">AI builds it for you</p>
          </div>
          <div className="hidden sm:block w-px h-8 bg-[#E5E7EB]" />
          <div>
            <p className="text-sm font-semibold text-[#111827]">Smart Routing</p>
            <p className="text-xs text-[#6B7280]">Score-based calendar booking</p>
          </div>
          <div className="hidden sm:block w-px h-8 bg-[#E5E7EB]" />
          <div>
            <p className="text-sm font-semibold text-[#111827]">Under 5 Minutes</p>
            <p className="text-xs text-[#6B7280]">To build and publish</p>
          </div>
        </div>

        <p className="text-[11px] text-[#B0B0B0] text-center mb-8 uppercase tracking-widest">Integrates with your favorite tools</p>
      </div>

      {/* Infinite scrolling logo ticker */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex animate-scroll items-center w-max">
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="shrink-0 mx-4 sm:mx-8 flex items-center gap-2 sm:gap-2.5 group"
              title={logo.name}
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={28}
                height={28}
                className="w-7 h-7 object-contain opacity-60 group-hover:opacity-90 transition-opacity duration-300"
              />
              <span className="hidden sm:inline text-sm font-medium text-[#B0B0B0] group-hover:text-[#6B7280] transition-colors duration-300">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
