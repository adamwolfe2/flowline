"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Users, UserPlus, Building2, Mail, Loader2, X } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

interface ClientRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  notes: string | null;
  createdAt: string;
  funnelCount: number;
  leadCount: number;
}

export default function ClientsPage() {
  const router = useRouter();
  const { isTeamContext, activeTeamId, activeTeam } = useWorkspace();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const brandColor = activeTeam?.branding?.primaryColor ?? "#2D6A4F";

  const loadClients = useCallback(async () => {
    if (!activeTeamId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${activeTeamId}/clients`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setClients(data.clients ?? []);
    } catch {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [activeTeamId]);

  useEffect(() => {
    if (isTeamContext && activeTeamId) {
      loadClients();
    } else {
      setLoading(false);
    }
  }, [isTeamContext, activeTeamId, loadClients]);

  function resetForm() {
    setFormName("");
    setFormEmail("");
    setFormCompany("");
    setFormNotes("");
  }

  async function handleCreateClient() {
    if (!formName.trim() || !formEmail.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/teams/${activeTeamId}/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          company: formCompany.trim() || null,
          notes: formNotes.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to create client");
        return;
      }
      const created = await res.json();
      setClients((prev) => [
        { ...created, funnelCount: 0, leadCount: 0 },
        ...prev,
      ]);
      setDialogOpen(false);
      resetForm();
      toast.success("Client added");
    } catch {
      toast.error("Failed to create client");
    } finally {
      setSubmitting(false);
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
          <Button
            variant="outline"
            className="gap-1.5"
          >
            Go to Settings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start sm:items-center justify-between gap-3 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTeam ? `${activeTeam.name} Clients` : "Clients"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your team&apos;s clients and their funnels.
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="gap-1.5 shrink-0"
          style={{ backgroundColor: brandColor, color: "#fff" }}
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Client</span>
        </Button>
      </motion.div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[160px] rounded-xl" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: `${brandColor}1A` }}
          >
            <Users className="w-7 h-7" style={{ color: brandColor }} />
          </div>
          <p className="text-base font-semibold text-[#111827] mb-1">
            No clients yet
          </p>
          <p className="text-sm text-[#9CA3AF] max-w-xs mb-5">
            Add your first client to organize funnels by customer.
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-1.5"
            style={{ backgroundColor: brandColor, color: "#fff" }}
          >
            <UserPlus className="w-4 h-4" />
            Add Client
          </Button>
        </div>
      ) : (
        /* Client grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <div
                onClick={() => router.push(`/clients/${client.id}`)}
                className="border border-[#E5E7EB] rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer bg-white"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: brandColor }}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {client.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                      <p className="text-xs text-gray-500 truncate">
                        {client.email}
                      </p>
                    </div>
                    {client.company && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                        <p className="text-xs text-gray-400 truncate">
                          {client.company}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                    {client.funnelCount} funnel{client.funnelCount !== 1 ? "s" : ""}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                    {client.leadCount} lead{client.leadCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
            <DialogDescription>
              Add a new client to your team workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
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
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
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
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
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
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Any notes about this client (optional)"
                rows={3}
                className="w-full px-2.5 py-1.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-colors resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDialogOpen(false); resetForm(); }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateClient}
              disabled={submitting || !formName.trim() || !formEmail.trim()}
              style={{ backgroundColor: brandColor, color: "#fff" }}
            >
              {submitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Adding...
                </span>
              ) : (
                "Add Client"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
