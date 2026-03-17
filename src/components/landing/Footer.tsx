"use client";

import { Zap } from "lucide-react";
import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Builder", href: "#how-it-works" },
      { label: "Analytics", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Coaches", href: "#" },
      { label: "Agencies", href: "#" },
      { label: "SaaS", href: "#" },
      { label: "Consultants", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Flowline</span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              The AI funnel builder that books calls. Create quiz-to-calendar
              funnels in minutes, not weeks.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Flowline. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
