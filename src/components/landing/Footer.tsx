import Link from "next/link";
import { Zap } from "lucide-react";

const links = {
  Product: [
    { label: "Builder", href: "/onboarding" },
    { label: "Analytics", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ],
  "Use Cases": [
    { label: "Coaches", href: "#" },
    { label: "Agencies", href: "#" },
    { label: "SaaS", href: "#" },
    { label: "Consultants", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Support", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-200 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-gray-900 rounded flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-sm text-gray-900">Flowline</span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              The AI funnel builder<br />that books calls.
            </p>
          </div>
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">{category}</p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-6 text-center">
          <p className="text-[11px] text-gray-400">
            &copy; {new Date().getFullYear()} Flowline. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
