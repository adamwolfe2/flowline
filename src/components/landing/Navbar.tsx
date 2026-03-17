"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-gray-200/60" : ""
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">Flowline</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#demo" className="hover:text-gray-900 transition-colors">Demo</a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}
