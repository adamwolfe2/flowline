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
    <section className="bg-white py-14 md:py-20 overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <p className="text-sm text-[#9CA3AF] text-center mb-10">
          Connects with the tools your team already lives in
        </p>
      </div>

      {/* Infinite scrolling logo ticker */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex animate-scroll items-center w-max">
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="shrink-0 mx-5 sm:mx-9 flex items-center gap-2.5 group"
              title={logo.name}
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={28}
                height={28}
                className="w-7 h-7 object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
              />
              <span className="hidden sm:inline text-[15px] font-medium text-[#B9BDC4] group-hover:text-[#4B5563] transition-colors duration-300">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
