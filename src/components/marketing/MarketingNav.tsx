"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import Image from "next/image";

const links = [
  { label: "Features", href: "/#features" },
  { label: "Templates", href: "/#templates" },
  { label: "Pricing", href: "/pricing" },
  { label: "Demo", href: "/build" },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(10,10,10,0.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 sm:h-[72px] flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="MyVSL" width={28} height={28} />
          <span
            className="text-[22px] font-bold tracking-tight text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-instrument-sans)" }}
          >
            MyVSL
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[15px] font-medium text-[#0A0A0A]/80 hover:text-[#0A0A0A] hover:bg-black/[0.04] rounded-full px-4 py-2 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-[15px] font-medium text-[#0A0A0A]/80 hover:text-[#0A0A0A] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-2 bg-[#0A0A0A] text-white rounded-full pl-5 pr-4 py-2.5 text-[15px] font-semibold hover:bg-[#232323] transition-all hover:shadow-lg hover:shadow-black/10"
          >
            Get started
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 hover:bg-black/[0.04] rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mx-4 mt-1 mb-4 rounded-3xl bg-white/95 backdrop-blur-xl border border-black/[0.06] shadow-2xl shadow-black/10 p-3 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-base font-medium text-[#0A0A0A] hover:bg-black/[0.04] rounded-2xl px-4 py-3 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-black/[0.06] my-1" />
          <Link href="/sign-in" className="text-base font-medium text-[#0A0A0A] px-4 py-3">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-[#0A0A0A] text-white rounded-full px-5 py-3.5 text-base font-semibold text-center hover:bg-[#232323] transition-colors"
          >
            Get started
          </Link>
        </div>
      )}
    </nav>
  );
}
