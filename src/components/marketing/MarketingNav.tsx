"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="sticky top-4 z-50 mx-auto max-w-[1039px] px-4">
      <div
        className={`flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-200 ${
          scrolled
            ? "bg-white/70 backdrop-blur-md shadow-sm border border-[#E5E7EB]"
            : "bg-white/50 backdrop-blur-sm"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2D6A4F]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span
            className="text-lg font-semibold text-[#171717]"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            MyVSL
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-1">
          {["Product", "Use Cases", "Pricing"].map((label) => (
            <Link
              key={label}
              href={`/${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-[#171717] hover:bg-neutral-100 rounded-[10px] px-[10px] py-2 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-[#171717] hover:text-[#6B7280] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-[#2D6A4F] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#245840] transition-colors"
          >
            Try it free &rarr;
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 rounded-2xl bg-white/90 backdrop-blur-md border border-[#E5E7EB] shadow-lg p-4 flex flex-col gap-2">
          {["Product", "Use Cases", "Pricing"].map((label) => (
            <Link
              key={label}
              href={`/${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-[#171717] hover:bg-neutral-100 rounded-[10px] px-3 py-2.5 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <hr className="border-[#E5E7EB] my-1" />
          <Link href="/sign-in" className="text-sm font-medium text-[#171717] px-3 py-2.5">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-[#2D6A4F] text-white rounded-lg px-4 py-2.5 text-sm font-medium text-center hover:bg-[#245840] transition-colors"
          >
            Try it free &rarr;
          </Link>
        </div>
      )}
    </nav>
  );
}
