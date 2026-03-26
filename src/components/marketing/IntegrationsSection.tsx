"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const integrations = [
  { name: "Calendly", icon: "/integrations/calendly.svg" },
  { name: "Cal.com", icon: "/integrations/calcom.svg" },
  { name: "Google Calendar", icon: "/integrations/google-calendar.svg" },
  { name: "Slack", icon: "/integrations/slack.svg" },
  { name: "HubSpot", icon: "/integrations/hubspot-svgrepo-com.svg" },
  { name: "Zapier", icon: "/integrations/zapier.svg" },
  { name: "Make", icon: "/integrations/make.svg" },
  { name: "Webhooks", icon: null },
];

const featured = [
  {
    title: "Calendar platforms",
    description: "Route leads directly to Calendly, Cal.com, or any booking link based on their quiz score.",
    badges: ["Calendly", "Cal.com", "Google Calendar"],
  },
  {
    title: "CRM & automation",
    description: "Send lead data to your CRM or trigger automations via webhooks, Zapier, or Make.",
    badges: ["Zapier", "Make", "Webhooks"],
  },
];

export function IntegrationsSection() {
  return (
    <section className="bg-white py-20 sm:py-28 border-t border-[#F3F4F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
              Connect to the tools<br className="hidden sm:block" /> you already use
            </h2>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-[#6B7280]">Works with your favorite scheduling and CRM tools</p>
            <Link href="/build" className="inline-flex items-center gap-1 text-sm font-medium text-[#111827] mt-1 hover:underline">
              View all integrations <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Logo grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-10">
          {integrations.map((int) => (
            <div
              key={int.name}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#E5E7EB] bg-white hover:shadow-md hover:border-[#D1D5DB] transition-all"
            >
              {int.icon ? (
                <Image src={int.icon} alt={int.name} width={32} height={32} className="w-8 h-8 object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-xs font-bold text-[#6B7280]">
                  {"{ }"}
                </div>
              )}
              <span className="text-[9px] text-[#9CA3AF] mt-2 text-center leading-tight">{int.name}</span>
            </div>
          ))}
        </div>

        {/* Featured integration cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featured.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-[#E5E7EB] hover:shadow-md transition-shadow">
              <h3 className="text-base font-semibold text-[#111827] mb-2">{f.title}</h3>
              <p className="text-sm text-[#6B7280] mb-4">{f.description}</p>
              <div className="flex flex-wrap gap-2">
                {f.badges.map((b) => (
                  <span key={b} className="text-[10px] font-medium text-[#374151] bg-[#F3F4F6] px-2.5 py-1 rounded-full">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
