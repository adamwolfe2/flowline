import Link from "next/link";
import Image from "next/image";

const columns = [
  {
    title: "Product",
    links: [
      { label: "AI Builder", href: "/#features" },
      { label: "Analytics", href: "/#features" },
      { label: "Templates", href: "/#templates" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Use cases",
    links: [
      { label: "Coaches", href: "/build" },
      { label: "Agencies", href: "/build" },
      { label: "SaaS", href: "/build" },
      { label: "Consultants", href: "/build" },
      { label: "Real Estate", href: "/build" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "vs ClickFunnels", href: "/compare/clickfunnels" },
      { label: "vs Typeform", href: "/compare/typeform" },
      { label: "vs Leadpages", href: "/compare/leadpages" },
      { label: "vs Unbounce", href: "/compare/unbounce" },
      { label: "vs Interact", href: "/compare/interact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Support", href: "mailto:support@getmyvsl.com" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-white pt-16 md:pt-24 pb-10 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] md:gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.png" alt="MyVSL" width={26} height={26} />
              <span
                className="text-xl font-bold tracking-tight text-[#0A0A0A]"
                style={{ fontFamily: "var(--font-instrument-sans)" }}
              >
                MyVSL
              </span>
            </Link>
            <p className="text-[15px] text-[#6B7280] leading-relaxed max-w-xs">
              AI funnels that qualify, score, and book your best leads while you
              sleep.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[15px] text-[#9CA3AF] mb-5">{col.title}</p>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[16px] font-medium text-[#0A0A0A] hover:text-[#0A9AFF] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-black/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#9CA3AF]">&copy; 2026 MyVSL, Inc.</p>
          <p className="text-sm text-[#9CA3AF]">
            Crafted for both you and your leads.
          </p>
        </div>
      </div>
    </footer>
  );
}
