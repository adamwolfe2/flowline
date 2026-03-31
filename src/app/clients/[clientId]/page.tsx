"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Building2,
  Mail,
  FileText,
  BarChart3,
  Eye,
  Loader2,
  Users,
  Plus,
  X,
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ClientFunnel {
  id: string;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  config: {
    brand: { name: string; logoUrl?: string; primaryColor?: string };
    [key: string]: unknown;
  };
  leadCount: number;
}

interface ClientStats {
  totalFunnels: number;
  totalLeads: number;
  totalSessions: number;
  conversionRate: number;
}

interface ClientDetail {
  id: string;
  name: string;
  email: string;
  company: string | null;
  notes: string | null;
  createdAt: string;
  funnels: ClientFunnel[];
  stats: ClientStats;
}

interface TeamFunnel {
  id: string;
  slug: string;
  published: boolean;
  config: {
    brand: { name: string };
    [key: string]: unknown;
  };
  clientId: string | null;
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId as string;
  const { isTeamContext, activeTeamId, activeTeam } = useWorkspace();
  const brandColor = activeTeam?.branding?.primaryColor ?? "#2D6A4F";

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Assign funnel
  const [assignOpen, setAssignOpen] = useState(false);
  const [teamFunnels, setTeamFunnels] = useState<TeamFunnel[]>([]);
  const [loadingFunnels, setLoadingFunnels] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  const loadClient = useCallback(async () => {
    if (!activeTeamId || !clientId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/teams/${activeTeamId}/clients/${clientId}`
      );
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Client not found");
          router.push("/clients");
          return;
        }
        throw new Error("Failed to load");
      }
      const data = await res.json();
      setClient(data);
    } catch {
      toast.error("Failed to load client details");
    } finally {
      setLoading(false);
    }
  }, [activeTeamId, clientId, router]);

  useEffect(() => {
    if (isTeamContext && activeTeamId) {
      loadClient();
    } else {
      setLoading(false);
    }
  }, [isTeamContext, activeTeamId, loadClient]);

  function openEditDialog() {
    if (!client) return;
    setEditName(client.name);
    setEditEmail(client.email);
    setEditCompany(client.company ?? "");
    setEditNotes(client.notes ?? "");
    setEditOpen(true);
  }

  async function handleSaveEdit() {
    if (!editName.trim() || !editEmail.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/teams/${activeTeamId}/clients/${clientId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editName.trim(),
            email: editEmail.trim(),
            company: editCompany.trim() || null,
            notes: editNotes.trim() || null,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to update client");
        return;
      }
      const updated = await res.json();
      setClient((prev) =>
        prev ? { ...prev, ...updated } : prev
      );
      setEditOpen(false);
      toast.success("Client updated");
    } catch {
      toast.error("Failed to update client");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/teams/${activeTeamId}/clients/${clientId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to delete client");
        return;
      }
      toast.success("Client deleted");
      router.push("/clients");
    } catch {
      toast.error("Failed to delete client");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  async function loadTeamFunnels() {
    if (!activeTeamId) return;
    setLoadingFunnels(true);
    try {
      const res = await fetch(`/api/funnels?teamId=${activeTeamId}`, {
        headers: { "x-workspace-team-id": activeTeamId },
      });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      // data may be an array of funnels
      const funnelList: TeamFunnel[] = (Array.isArray(data) ? data : []).map(
        (f: Record<string, unknown>) => ({
          id: f.id as string,
          slug: f.slug as string,
          published: f.published as boolean,
          config: f.config as TeamFunnel["config"],
          clientId: (f.clientId as string | null) ?? null,
        })
      );
      setTeamFunnels(funnelList);
    } catch {
      toast.error("Failed to load funnels");
    } finally {
      setLoadingFunnels(false);
    }
  }

  function openAssignDialog() {
    setAssignOpen(true);
    loadTeamFunnels();
  }

  async function handleAssignFunnel(funnelId: string) {
    setAssigning(funnelId);
    try {
      const res = await fetch(`/api/funnels/${funnelId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-workspace-team-id": activeTeamId ?? "",
        },
        body: JSON.stringify({ clientId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to assign funnel");
        return;
      }
      toast.success("Funnel assigned");
      setAssignOpen(false);
      loadClient();
    } catch {
      toast.error("Failed to assign funnel");
    } finally {
      setAssigning(null);
    }
  }

  // Not in team context
  if (!isTeamContext) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Users className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-base font-semibold text-[#111827] mb-1">
          Team workspace required
        </p>
        <p className="text-sm text-[#9CA3AF] max-w-xs mb-5">
          Switch to a team workspace to manage clients.
        </p>
        <Link href="/settings">
          <Button variant="outline" className="gap-1.5">
            Go to Settings
          </Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[90px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[200px] rounded-xl" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Users className="w-10 h-10 text-[#D1D5DB] mb-3" />
        <p className="text-sm font-medium text-[#6B7280]">Client not found</p>
        <Link href="/clients" className="text-sm mt-2" style={{ color: brandColor }}>
          Back to Clients
        </Link>
      </div>
    );
  }

  const unassignedFunnels = teamFunnels.filter(
    (f) => !f.clientId || f.clientId === clientId
  );
  const availableFunnels = teamFunnels.filter(
    (f) =>
      !f.clientId &&
      !client.funnels.some((cf) => cf.id === f.id)
  );

  const statCards = [
    { label: "Funnels", value: client.stats.totalFunnels, icon: FileText },
    { label: "Leads", value: client.stats.totalLeads, icon: Users },
    { label: "Sessions", value: client.stats.totalSessions, icon: Eye },
    {
      label: "Conversion",
      value:
        client.stats.totalSessions > 0
          ? `${client.stats.conversionRate}%`
          : "--",
      icon: BarChart3,
    },
  ];

  return (
    <div>
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start sm:items-center justify-between gap-3 mb-6"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Clients
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-semibold text-gray-900 truncate">
            {client.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={openEditDialog}
            className="gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </motion.div>

      {/* Client info card */}
      <div className="border border-[#E5E7EB] rounded-xl p-4 sm:p-5 bg-white mb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-gray-900">
              {client.name}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <p className="text-sm text-gray-500">{client.email}</p>
            </div>
            {client.company && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <p className="text-sm text-gray-400">{client.company}</p>
              </div>
            )}
            {client.notes && (
              <p className="text-sm text-gray-400 mt-2 whitespace-pre-wrap">
                {client.notes}
              </p>
            )}
            <p className="text-xs text-gray-300 mt-2">
              Added {new Date(client.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="border border-[#E5E7EB] rounded-xl p-4 bg-white"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <stat.icon className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Assigned funnels */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Assigned Funnels
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={openAssignDialog}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Assign Funnel
          </Button>
        </div>

        {client.funnels.length === 0 ? (
          <div className="border border-[#E5E7EB] rounded-xl bg-white py-12 flex flex-col items-center text-center">
            <FileText className="w-8 h-8 text-[#D1D5DB] mb-2" />
            <p className="text-sm font-medium text-[#6B7280]">
              No funnels assigned
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1 max-w-xs">
              Assign a funnel to this client to track their performance.
            </p>
          </div>
        ) : (
          <div className="border border-[#E5E7EB] rounded-xl bg-white divide-y divide-[#E5E7EB] overflow-hidden">
            {client.funnels.map((funnel) => (
              <Link
                key={funnel.id}
                href={`/builder/${funnel.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{
                      backgroundColor:
                        funnel.config?.brand?.primaryColor ?? brandColor,
                    }}
                  >
                    {(funnel.config?.brand?.name ?? funnel.slug)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {funnel.config?.brand?.name ?? funnel.slug}
                    </p>
                    <p className="text-xs text-gray-400">{funnel.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-500">
                    {funnel.leadCount} lead
                    {funnel.leadCount !== 1 ? "s" : ""}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${
                      funnel.published
                        ? "bg-white border border-[#E5E7EB] text-[#2D6A4F]"
                        : ""
                    }`}
                  >
                    {funnel.published ? "Live" : "Draft"}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Edit Client Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update this client&apos;s information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Client name"
                className="text-sm"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="client@example.com"
                className="text-sm"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Company
              </label>
              <Input
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
                placeholder="Company name (optional)"
                className="text-sm"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Notes
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Any notes about this client (optional)"
                rows={3}
                className="w-full px-2.5 py-1.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-colors resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving || !editName.trim() || !editEmail.trim()}
              style={{ backgroundColor: brandColor, color: "#fff" }}
            >
              {saving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm font-semibold text-gray-900">
              {client.name}
            </p>
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
              This will permanently delete this client. Any funnels assigned to
              them will be unassigned but not deleted.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Funnel Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Funnel</DialogTitle>
            <DialogDescription>
              Select a funnel to assign to {client.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 max-h-[300px] overflow-y-auto">
            {loadingFunnels ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : availableFunnels.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#6B7280]">
                  No unassigned funnels available
                </p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  All team funnels are already assigned to clients.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {availableFunnels.map((funnel) => (
                  <button
                    key={funnel.id}
                    onClick={() => handleAssignFunnel(funnel.id)}
                    disabled={assigning === funnel.id}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#F9FAFB] transition-colors text-left disabled:opacity-50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {funnel.config?.brand?.name ?? funnel.slug}
                      </p>
                      <p className="text-xs text-gray-400">{funnel.slug}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          funnel.published
                            ? "bg-white border border-[#E5E7EB] text-[#2D6A4F]"
                            : ""
                        }`}
                      >
                        {funnel.published ? "Live" : "Draft"}
                      </Badge>
                      {assigning === funnel.id && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
