"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Download, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { LeadDetailModal } from "@/components/analytics/LeadDetailModal";
import { toast } from "sonner";

interface LeadRow {
  id: string;
  email: string;
  funnelId: string;
  score: number;
  calendarTier: string;
  answers: Record<string, string>;
  createdAt: string;
}

interface FunnelOption {
  id: string;
  name: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [funnels, setFunnels] = useState<FunnelOption[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [funnelFilter, setFunnelFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateRange, setDateRange] = useState<string>("all");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, funnelFilter, tierFilter, dateRange]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (funnelFilter) params.set("funnelId", funnelFilter);
      if (tierFilter) params.set("tier", tierFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/leads?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeads(data.leads);
      setTotal(data.total);
      if (data.funnels) setFunnels(data.funnels);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, funnelFilter, tierFilter, debouncedSearch]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const totalPages = Math.max(1, Math.ceil(total / 25));

  const funnelNameMap: Record<string, string> = {};
  for (const f of funnels) {
    funnelNameMap[f.id] = f.name || "Untitled";
  }

  const tierBadge = (tier: string) => {
    const styles: Record<string, string> = {
      high: "bg-emerald-100 text-emerald-700",
      mid: "bg-amber-100 text-amber-700",
      low: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${styles[tier] || styles.low}`}>
        {tier.toUpperCase()}
      </span>
    );
  };

  const displayedLeads = useMemo(() => {
    if (dateRange === "all") return leads;
    const now = new Date();
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return leads.filter((l) => new Date(l.createdAt) >= cutoff);
  }, [leads, dateRange]);

  async function exportCSV() {
    try {
      // Fetch ALL leads (not just current page) with current filters
      const params = new URLSearchParams();
      if (funnelFilter) params.set("funnelId", funnelFilter);
      if (tierFilter) params.set("tier", tierFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("page", "0");
      params.set("limit", "10000"); // Fetch all

      const res = await fetch(`/api/leads?${params}`);
      if (!res.ok) {
        toast.error("Failed to export leads");
        return;
      }
      const data = await res.json();
      const allLeads: LeadRow[] = data.leads || [];

      if (allLeads.length === 0) {
        toast.error("No leads to export");
        return;
      }

      // Apply date range filter client-side
      let filteredLeads = allLeads;
      if (dateRange !== "all") {
        const now = new Date();
        const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filteredLeads = allLeads.filter((l) => new Date(l.createdAt) >= cutoff);
      }

      if (filteredLeads.length === 0) {
        toast.error("No leads match current filters");
        return;
      }

      // Collect answer keys
      const answerKeys = new Set<string>();
      for (const lead of filteredLeads) {
        if (lead.answers && typeof lead.answers === "object") {
          for (const key of Object.keys(lead.answers)) {
            answerKeys.add(key);
          }
        }
      }
      const sortedKeys = Array.from(answerKeys).sort();

      const header = ["Email", "Funnel", "Score", "Tier", "Date", ...sortedKeys].join(",") + "\n";
      const rows = filteredLeads
        .map((l) => {
          const fName = (funnelNameMap[l.funnelId] || "").replace(/,/g, " ");
          const date = new Date(l.createdAt).toLocaleDateString();
          const answerCols = sortedKeys.map((k) => {
            const val = l.answers?.[k] ?? "";
            return String(val).replace(/,/g, " ");
          });
          return [l.email, fName, l.score, l.calendarTier, date, ...answerCols].join(",");
        })
        .join("\n");
      const blob = new Blob([header + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${filteredLeads.length} leads`);
    } catch {
      toast.error("Export failed");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Leads</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {total} total lead{total !== 1 ? "s" : ""} across all funnels
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B7280] bg-white border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-colors"
          />
        </div>
        <select
          value={funnelFilter}
          onChange={(e) => setFunnelFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-colors"
        >
          <option value="">All funnels</option>
          {funnels.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name || "Untitled"}
            </option>
          ))}
        </select>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-colors"
        >
          <option value="">All tiers</option>
          <option value="high">High</option>
          <option value="mid">Mid</option>
          <option value="low">Low</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-colors"
        >
          <option value="all">All time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayedLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-10 h-10 text-[#D1D5DB] mb-3" />
            <p className="text-sm font-medium text-[#6B7280]">No leads found</p>
            <p className="text-xs text-[#9CA3AF] mt-1">
              {debouncedSearch || funnelFilter || tierFilter
                ? "Try adjusting your filters."
                : "Leads will appear here once your funnels start collecting them."}
            </p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-4 py-3">
                    Email
                  </th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                    Funnel
                  </th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-4 py-3">
                    Score
                  </th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-4 py-3">
                    Tier
                  </th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-[#111827] truncate max-w-[200px]">
                      {lead.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B7280] hidden sm:table-cell truncate max-w-[150px]">
                      {funnelNameMap[lead.funnelId] || "Untitled"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">
                      {lead.score}
                    </td>
                    <td className="px-4 py-3">
                      {tierBadge(lead.calendarTier)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B7280] hidden sm:table-cell">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                <p className="text-xs text-[#6B7280]">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lead detail modal */}
      <LeadDetailModal leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
    </div>
  );
}
