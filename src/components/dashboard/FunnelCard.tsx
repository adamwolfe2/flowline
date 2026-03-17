"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { BarChart3, ExternalLink, MoreVertical, Pencil, Users, Eye, Target, Trash2, Copy } from "lucide-react";

interface FunnelCardProps {
  funnel: Funnel;
  stats: FunnelStats;
  onDelete?: (id: string) => void;
  onDuplicate?: () => void;
}

export function FunnelCard({ funnel, stats, onDelete, onDuplicate }: FunnelCardProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
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
          slug: `${funnel.slug}-copy`,
        }),
      });
      if (res.ok) {
        toast.success("Funnel duplicated");
        onDuplicate?.();
      } else {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error || "Failed to duplicate funnel");
      }
    } catch (err) {
      console.error("Failed to duplicate funnel:", err);
      toast.error("Failed to duplicate funnel");
    } finally {
      setDuplicating(false);
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
    } catch (err) {
      console.error("Failed to delete funnel:", err);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <Card className="p-5 hover:shadow-md transition-shadow border-gray-100 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: funnel.config.brand.primaryColor }}
            >
              {funnel.config.brand.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {funnel.config.brand.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">{funnel.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant={funnel.published ? "default" : "secondary"} className="text-[10px]">
              {funnel.published ? (
                <span className="flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
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
            <p className="text-lg font-bold text-gray-900">{stats.totalSessions}</p>
            <p className="text-[10px] text-gray-400">Views</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Users className="w-3 h-3 text-gray-400" />
            </div>
            <p className="text-lg font-bold text-gray-900">{stats.leadsThisMonth}</p>
            <p className="text-[10px] text-gray-400">Leads</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Target className="w-3 h-3 text-gray-400" />
            </div>
            <p className="text-lg font-bold text-gray-900">{stats.totalSessions === 0 ? "\u2014" : `${stats.conversionRate}%`}</p>
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Funnel</DialogTitle>
            <DialogDescription>
              Are you sure? This will permanently delete this funnel and all its leads.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
