"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Funnel, FunnelStats } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BarChart3, ExternalLink, MoreVertical, Pencil, Users, Eye, Target, Trash2, Copy, Share2, Loader2 } from "lucide-react";

interface FunnelCardProps {
  funnel: Funnel & { clientName?: string | null };
  stats: FunnelStats;
  onDelete?: (id: string) => void;
  onDuplicate?: () => void;
}

function AnimatedNumber({ value }: { value: number }) {
  return <>{value}</>;
}

export function FunnelCard({ funnel, stats, onDelete, onDuplicate }: FunnelCardProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  async function handleDuplicate() {
    setDuplicating(true);
    try {
      const res = await fetch("/api/funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: funnel.config,
          slug: `${funnel.slug}-copy-${Math.random().toString(36).slice(2, 6)}`,
        }),
      });
      if (res.ok) {
        toast.success("Funnel duplicated");
        onDuplicate?.();
      } else {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error || "Failed to duplicate funnel");
      }
    } catch {
      toast.error("Failed to duplicate funnel");
    } finally {
      setDuplicating(false);
    }
  }

  async function handleShare() {
    if (!shareEmail.trim()) return;
    setSharing(true);
    try {
      const res = await fetch(`/api/funnels/${funnel.id}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetEmail: shareEmail.trim() }),
      });
      if (res.ok) {
        toast.success("Funnel shared! They can find it in their dashboard.");
        setShareOpen(false);
        setShareEmail("");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to share funnel");
      }
    } catch {
      toast.error("Failed to share funnel");
    } finally {
      setSharing(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/funnels/${funnel.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete?.(funnel.id);
        toast.success("Funnel deleted");
      } else {
        toast.error("Failed to delete funnel");
      }
    } catch {
      toast.error("Failed to delete funnel");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2, transition: { duration: 0.15 } }}
        className="group"
      >
        <Card className="p-5 transition-shadow duration-200 group-hover:shadow-lg border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {funnel.config.brand.logoUrl ? (
                <div className="w-10 h-10 rounded-xl border border-[#E5E7EB] overflow-hidden bg-white flex items-center justify-center">
                  <img src={funnel.config.brand.logoUrl} alt="" className="w-full h-full object-contain p-1" />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: funnel.config.brand.primaryColor }}
                >
                  {funnel.config.brand.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                  {funnel.config.brand.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-gray-400">{funnel.slug}</p>
                  {funnel.clientName && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                      {funnel.clientName}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className={`text-[10px] ${funnel.published ? "bg-white border border-[#E5E7EB] text-[#2D6A4F]" : ""}`}>
                {funnel.published ? (
                  <span className="flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D6A4F] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2D6A4F]" />
                    </span>
                    Live
                  </span>
                ) : "Draft"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent hover:text-accent-foreground" aria-label="Funnel actions">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/builder/${funnel.id}`)}>
                    <Pencil className="w-3.5 h-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/analytics/${funnel.id}`)}>
                    <BarChart3 className="w-3.5 h-3.5 mr-2" />
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate} disabled={duplicating}>
                    <Copy className="w-3.5 h-3.5 mr-2" />
                    {duplicating ? "Duplicating..." : "Duplicate"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShareOpen(true)}>
                    <Share2 className="w-3.5 h-3.5 mr-2" />
                    Share to Client
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Eye className="w-3 h-3 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                <AnimatedNumber value={stats?.totalSessions ?? 0} />
              </p>
              <p className="text-[10px] text-gray-400">Views</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Users className="w-3 h-3 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                <AnimatedNumber value={stats?.leadsThisMonth ?? 0} />
              </p>
              <p className="text-[10px] text-gray-400">Leads</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Target className="w-3 h-3 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-900">{!stats || stats.totalSessions === 0 ? "--" : `${stats.conversionRate}%`}</p>
              <p className="text-[10px] text-gray-400">Conv.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/builder/${funnel.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <Pencil className="w-3 h-3" />
                Edit
              </Button>
            </Link>
            <Link href={`/analytics/${funnel.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <BarChart3 className="w-3 h-3" />
                Analytics
              </Button>
            </Link>
            {funnel.published && (
              <a href={`/f/${funnel.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="px-2" aria-label="View live funnel">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            )}
          </div>
        </Card>
      </motion.div>

      <Dialog open={confirmOpen} onOpenChange={(open) => { setConfirmOpen(open); if (!open) setConfirmSlug(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Funnel</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm font-semibold text-gray-900">{funnel.config.brand.name}</p>
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
              This will permanently delete this funnel and all its data (sessions, leads, analytics).
            </p>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">
                Type <span className="font-mono font-semibold text-gray-700">{funnel.slug}</span> to confirm
              </label>
              <Input
                value={confirmSlug}
                onChange={e => setConfirmSlug(e.target.value)}
                placeholder={funnel.slug}
                className="text-sm font-mono"
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setConfirmOpen(false); setConfirmSlug(""); }} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting || confirmSlug !== funnel.slug}>
              {deleting ? "Deleting..." : "Delete Forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share to Client</DialogTitle>
            <DialogDescription>
              Clone this funnel to another MyVSL user&apos;s account. They must have an existing account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              type="email"
              placeholder="client@example.com"
              value={shareEmail}
              onChange={e => setShareEmail(e.target.value)}
              className="text-sm"
              onKeyDown={e => { if (e.key === "Enter") handleShare(); }}
            />
            <p className="text-[10px] text-gray-400 mt-1.5">
              The funnel will appear as a new draft in their dashboard.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareOpen(false)} disabled={sharing}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={sharing || !shareEmail.trim()}>
              {sharing ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Sharing...
                </span>
              ) : (
                "Clone to Their Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
