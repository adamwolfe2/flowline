import Link from "next/link";
import { Zap } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Builder", href: "/product" },
      { label: "Analytics", href: "/product" },
      { label: "Templates", href: "/product" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Coaches", href: "/use-cases" },
      { label: "Agencies", href: "/use-cases" },
      { label: "SaaS", href: "/use-cases" },
      { label: "Consultants", href: "/use-cases" },
      { label: "Real Estate", href: "/use-cases" },
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
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2D6A4F]">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span
                className="text-lg font-semibold text-[#171717]"
                style={{ fontFamily: "var(--font-outfit)" }}
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
          <p className="text-xs text-[#A3A3A3]">
            &copy; 2026 MyVSL, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
