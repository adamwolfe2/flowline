"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <nav className={`flex items-center justify-between gap-6 px-5 h-12 rounded-full transition-all duration-300 max-w-3xl w-full ${
        scrolled
          ? "bg-white/90 backdrop-blur-lg shadow-sm border border-gray-200/50"
          : "bg-white/70 backdrop-blur-md border border-white/40"
      }`}>
        <Link href="/" className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">Qualifi</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">Product</a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          <a href="#examples" className="hover:text-gray-900 transition-colors">Examples</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Sign in</Link>
          <Link href="/sign-up" className="bg-gray-900 text-white text-xs px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors font-medium">
            Create account
          </Link>
        </div>

        <button className="md:hidden text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 top-16 bg-white/95 backdrop-blur-lg z-40 p-6 md:hidden">
          <div className="space-y-4">
            <a href="#features" className="block text-lg text-gray-900" onClick={() => setMobileOpen(false)}>Product</a>
            <a href="#pricing" className="block text-lg text-gray-900" onClick={() => setMobileOpen(false)}>Pricing</a>
            <a href="#examples" className="block text-lg text-gray-900" onClick={() => setMobileOpen(false)}>Examples</a>
            <div className="pt-4 border-t space-y-3">
              <Link href="/sign-in" className="block text-gray-600">Sign in</Link>
              <Link href="/sign-up" className="block bg-gray-900 text-white text-center py-3 rounded-xl">Create account</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
