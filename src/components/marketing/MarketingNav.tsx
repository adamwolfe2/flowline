"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#09090B]/90 backdrop-blur-md border-b border-white/10"
          : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#6366F1] rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-base tracking-tight font-[family-name:var(--font-sora)]">
            Qualifi
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#examples" className="hover:text-white transition-colors">
            Examples
          </a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-[#6366F1] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#5558E6] transition-colors"
          >
            Start Free
          </Link>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#09090B] border-t border-white/10 px-6 py-6 space-y-4">
          <a
            href="#features"
            className="block text-sm text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            Features
          </a>
          <a
            href="#pricing"
            className="block text-sm text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </a>
          <div className="pt-4 border-t border-white/10 space-y-3">
            <Link href="/sign-in" className="block text-sm text-gray-400">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="block bg-[#6366F1] text-white text-sm px-4 py-2.5 rounded-lg text-center"
            >
              Start Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
