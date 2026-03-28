import Link from "next/link";
import Image from "next/image";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Builder", href: "/#features" },
      { label: "Analytics", href: "/#features" },
      { label: "Templates", href: "/#demo" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Coaches", href: "/build" },
      { label: "Agencies", href: "/build" },
      { label: "SaaS", href: "/build" },
      { label: "Consultants", href: "/build" },
      { label: "Real Estate", href: "/build" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-white border-t border-[#E5E7EB] py-10 md:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-4 gap-4 sm:gap-6 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] md:gap-10 mb-10 md:mb-12">
          {/* Brand */}
          <div className="col-span-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-2 md:mb-4">
              <Image src="/logo.png" alt="MyVSL" width={20} height={20} />
              <span
                className="text-lg font-semibold text-[#171717]"
                style={{ fontFamily: "var(--font-plus-jakarta)" }}
              >
                MyVSL
              </span>
            </Link>
            <p className="hidden md:block text-sm text-[#6B7280] leading-relaxed max-w-xs">
              VSL funnels. Built in minutes. No agency needed.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[10px] sm:text-xs font-semibold text-[#111827] uppercase tracking-wider mb-2 sm:mb-4">
                {col.title}
              </p>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E5E7EB] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#9CA3AF]">
            &copy; 2026 MyVSL, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
