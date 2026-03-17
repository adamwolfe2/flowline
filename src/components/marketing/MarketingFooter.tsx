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
      { label: "Coaches", href: "/onboarding" },
      { label: "Agencies", href: "/onboarding" },
      { label: "SaaS", href: "/onboarding" },
      { label: "Consultants", href: "/onboarding" },
      { label: "Real Estate", href: "/onboarding" },
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
    <footer className="bg-white border-t border-[#E5E7EB] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.png" alt="MyVSL" width={20} height={20} />
              <span
                className="text-lg font-semibold text-[#171717]"
                style={{ fontFamily: "var(--font-lora)" }}
              >
                MyVSL
              </span>
            </Link>
            <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs">
              VSL funnels. Built in minutes. No agency needed.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold text-[#111827] uppercase tracking-wider mb-4">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
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
