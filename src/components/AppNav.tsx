"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Plus, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/settings", label: "Settings" },
  { href: "/billing", label: "Billing" },
];

export function AppNav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.isAdmin) setIsAdmin(true); })
      .catch(() => {});
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-[#111827]">
            <Image src="/logo.png" alt="MyVSL" width={24} height={24} />
            <span className="hidden sm:inline">MyVSL</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "text-[#2D6A4F] font-medium bg-[#2D6A4F]/5"
                      : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  pathname === "/admin"
                    ? "text-[#2D6A4F] font-medium bg-[#2D6A4F]/5"
                    : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/build">
            <Button size="sm" className="gap-1.5 bg-[#2D6A4F] hover:bg-[#245840]">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Funnel</span>
            </Button>
          </Link>
          <UserButton />
          <button
            className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[#E5E7EB] bg-white px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm px-3 py-2.5 rounded-lg transition-colors min-h-[44px] flex items-center ${
                  isActive
                    ? "text-[#2D6A4F] font-medium bg-[#2D6A4F]/5"
                    : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={`text-sm px-3 py-2.5 rounded-lg transition-colors flex items-center gap-1 min-h-[44px] ${
                pathname === "/admin"
                  ? "text-[#2D6A4F] font-medium bg-[#2D6A4F]/5"
                  : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
