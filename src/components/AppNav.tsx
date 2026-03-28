"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Plus, Shield, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { CommandPalette } from "@/components/CommandPalette";

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
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.isAdmin) setIsAdmin(true); })
      .catch(() => {});
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setPaletteOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-[#111827]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
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
                  className={`relative text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "text-[#2D6A4F] font-medium"
                      : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-bg"
                      className="absolute inset-0 bg-[#2D6A4F]/5 rounded-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className={`relative text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  pathname === "/admin"
                    ? "text-[#2D6A4F] font-medium"
                    : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
                }`}
              >
                {pathname === "/admin" && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 bg-[#2D6A4F]/5 rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Shield className="w-3.5 h-3.5 relative" />
                <span className="relative">Admin</span>
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cmd+K hint — desktop only */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9FAFB] border border-[#E5E7EB] transition-colors"
            aria-label="Open command palette"
          >
            <span>Search</span>
            <kbd className="flex items-center gap-0.5 font-sans">
              <span className="text-[10px] leading-none">⌘</span>
              <span className="text-[10px] leading-none">K</span>
            </kbd>
          </button>
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
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="sm:hidden border-t border-[#E5E7EB] bg-white overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
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
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette
        isAdmin={isAdmin}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
      />
    </nav>
  );
}
