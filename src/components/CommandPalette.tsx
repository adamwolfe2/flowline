"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  Plus,
  Users,
  Settings,
  CreditCard,
  Shield,
  ExternalLink,
  BarChart3,
  Pencil,
  Search,
} from "lucide-react";

interface FunnelItem {
  id: string;
  name: string;
}

interface CommandPaletteProps {
  isAdmin?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATIC_ITEMS = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { id: "build", label: "Build New Funnel", href: "/build", icon: Plus },
  { id: "leads", label: "Leads", href: "/leads", icon: Users },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings },
  { id: "billing", label: "Billing", href: "/billing", icon: CreditCard },
];

export function CommandPalette({ isAdmin = false, open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [funnels, setFunnels] = useState<FunnelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);

  // Fetch funnels once on mount
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setLoading(true);
    fetch("/api/funnels")
      .then(r => r.ok ? r.json() : [])
      .then((data: Array<{ id: string; name?: string; config?: { brand?: { name?: string } } }>) => {
        const items = Array.isArray(data) ? data.map(f => ({
          id: f.id,
          name: f.config?.brand?.name || f.name || "Untitled",
        })) : [];
        setFunnels(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const navigate = useCallback((href: string) => {
    onOpenChange(false);
    setSearch("");
    router.push(href);
  }, [router, onOpenChange]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onOpenChange(false);
        setSearch("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => { onOpenChange(false); setSearch(""); }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-[560px] bg-white rounded-xl border border-[#E5E7EB] shadow-2xl overflow-hidden">
        <Command
          label="Command palette"
          loop
          className="flex flex-col"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
            <Search className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search pages, funnels..."
              autoFocus
              className="flex-1 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none bg-transparent"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-[#9CA3AF] bg-[#F3F4F6] border border-[#E5E7EB]">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-[#6B7280]">
              {loading ? "Loading..." : "No results found."}
            </Command.Empty>

            {/* Navigation group */}
            <Command.Group
              heading="Navigate"
              className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[#9CA3AF] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
            >
              {STATIC_ITEMS.map(item => (
                <Command.Item
                  key={item.id}
                  value={item.label}
                  onSelect={() => navigate(item.href)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-[#374151] data-[selected=true]:bg-[#F3F4F6] data-[selected=true]:text-[#111827] transition-colors"
                >
                  <item.icon className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                  {item.label}
                </Command.Item>
              ))}
              {isAdmin && (
                <Command.Item
                  value="Admin"
                  onSelect={() => navigate("/admin")}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-[#374151] data-[selected=true]:bg-[#F3F4F6] data-[selected=true]:text-[#111827] transition-colors"
                >
                  <Shield className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                  Admin
                </Command.Item>
              )}
            </Command.Group>

            {/* Funnels group */}
            {funnels.length > 0 && (
              <Command.Group
                heading="Funnels"
                className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[#9CA3AF] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 mt-1"
              >
                {funnels.map(funnel => (
                  <Command.Group key={funnel.id} className="[&_[cmdk-group-heading]]:hidden">
                    <Command.Item
                      value={`${funnel.name} edit`}
                      keywords={[funnel.name, "edit", "builder"]}
                      onSelect={() => navigate(`/builder/${funnel.id}`)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-[#374151] data-[selected=true]:bg-[#F3F4F6] data-[selected=true]:text-[#111827] transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                      <span className="flex-1 truncate">{funnel.name}</span>
                      <span className="text-xs text-[#9CA3AF]">Edit</span>
                    </Command.Item>
                    <Command.Item
                      value={`${funnel.name} analytics`}
                      keywords={[funnel.name, "analytics", "stats"]}
                      onSelect={() => navigate(`/analytics/${funnel.id}`)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-[#374151] data-[selected=true]:bg-[#F3F4F6] data-[selected=true]:text-[#111827] transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                      <span className="flex-1 truncate">{funnel.name}</span>
                      <span className="text-xs text-[#9CA3AF]">Analytics</span>
                    </Command.Item>
                    <Command.Item
                      value={`${funnel.name} preview`}
                      keywords={[funnel.name, "preview", "view"]}
                      onSelect={() => { onOpenChange(false); setSearch(""); window.open(`/f/preview/${funnel.id}`, "_blank"); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-[#374151] data-[selected=true]:bg-[#F3F4F6] data-[selected=true]:text-[#111827] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                      <span className="flex-1 truncate">{funnel.name}</span>
                      <span className="text-xs text-[#9CA3AF]">Preview</span>
                    </Command.Item>
                  </Command.Group>
                ))}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer hint */}
          <div className="hidden sm:flex items-center justify-end gap-3 px-4 py-2 border-t border-[#E5E7EB] bg-[#F9FAFB]">
            <span className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
              <kbd className="px-1 py-0.5 rounded border border-[#E5E7EB] bg-white text-[10px]">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
              <kbd className="px-1 py-0.5 rounded border border-[#E5E7EB] bg-white text-[10px]">↵</kbd> select
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
              <kbd className="px-1 py-0.5 rounded border border-[#E5E7EB] bg-white text-[10px]">ESC</kbd> close
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
