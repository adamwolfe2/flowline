"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Plus, Shield, Menu, X, ChevronDown, Building2, User, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { CommandPalette } from "@/components/CommandPalette";
import { useWorkspace } from "@/hooks/useWorkspace";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/clients", label: "Clients" },
  { href: "/settings", label: "Settings" },
  { href: "/billing", label: "Billing" },
];

/** Darken a hex color by a percentage (0-100). */
function darkenHex(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.round(((num >> 16) & 0xff) * (1 - percent / 100)));
  const g = Math.max(0, Math.round(((num >> 8) & 0xff) * (1 - percent / 100)));
  const b = Math.max(0, Math.round((num & 0xff) * (1 - percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function AppNav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const wsDropdownRef = useRef<HTMLDivElement>(null);

  const { workspace, setWorkspace, teams, activeTeam, loading: wsLoading } = useWorkspace();

  const branding = activeTeam?.branding;
  const brandColor = branding?.primaryColor ?? "#2D6A4F";
  const brandHoverColor = branding?.primaryColor
    ? darkenHex(branding.primaryColor, 15)
    : "#245840";
  const appName = branding?.appName ?? "MyVSL";

  useEffect(() => {
    fetch("/api/user")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.isAdmin) setIsAdmin(true); })
      .catch(() => {});
  }, []);

  // Close workspace dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(e.target as Node)) {
        setWsDropdownOpen(false);
      }
    }
    if (wsDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [wsDropdownOpen]);

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
            {branding?.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={appName}
                style={{ height: 24, width: "auto", maxWidth: 120 }}
              />
            ) : (
              <>
                <Image src="/logo.png" alt={appName} width={24} height={24} />
                <span className="hidden sm:inline">{appName}</span>
              </>
            )}
          </Link>

          {/* Workspace switcher */}
          {!wsLoading && teams.length > 0 && (
            <div className="relative" ref={wsDropdownRef}>
              <button
                onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151]"
              >
                {workspace === "personal" ? (
                  <User className="w-3.5 h-3.5 text-[#6B7280]" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-[#6B7280]" />
                )}
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {workspace === "personal" ? "Personal" : (activeTeam?.name ?? "Team")}
                </span>
                <ChevronDown className={`w-3 h-3 text-[#9CA3AF] transition-transform ${wsDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {wsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => { setWorkspace("personal"); setWsDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F9FAFB] transition-colors flex items-center justify-between ${
                      workspace === "personal" ? "bg-[#F9FAFB] font-medium text-[#111827]" : "text-[#374151]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#6B7280]" />
                      Personal
                    </span>
                    {workspace === "personal" && <Check className="w-3.5 h-3.5" style={{ color: brandColor }} />}
                  </button>

                  <div className="border-t border-[#E5E7EB]" />

                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => { setWorkspace(team.id); setWsDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F9FAFB] transition-colors flex items-center justify-between ${
                        workspace === team.id ? "bg-[#F9FAFB] font-medium text-[#111827]" : "text-[#374151]"
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Building2 className="w-3.5 h-3.5 text-[#6B7280] flex-shrink-0" />
                        <span className="truncate">{team.name}</span>
                      </span>
                      {workspace === team.id && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: brandColor }} />}
                    </button>
                  ))}

                  <div className="border-t border-[#E5E7EB]" />

                  <Link
                    href="/settings"
                    onClick={() => setWsDropdownOpen(false)}
                    className="block w-full text-left px-3 py-2 text-xs text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
                  >
                    Create Team
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "font-medium"
                      : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
                  }`}
                  style={isActive ? { color: brandColor } : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-bg"
                      className="absolute inset-0 rounded-lg"
                      style={{ backgroundColor: `${brandColor}0D` }}
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
                    ? "font-medium"
                    : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
                }`}
                style={pathname === "/admin" ? { color: brandColor } : undefined}
              >
                {pathname === "/admin" && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-lg"
                    style={{ backgroundColor: `${brandColor}0D` }}
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
            <Button
              size="sm"
              className="gap-1.5"
              style={{ backgroundColor: brandColor, color: "#fff" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = brandHoverColor; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = brandColor; }}
            >
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
                        ? "font-medium"
                        : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
                    }`}
                    style={isActive ? { color: brandColor, backgroundColor: `${brandColor}0D` } : undefined}
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
                      ? "font-medium"
                      : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
                  }`}
                  style={pathname === "/admin" ? { color: brandColor, backgroundColor: `${brandColor}0D` } : undefined}
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
