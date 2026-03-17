"use client";

import { useState } from "react";
import { Funnel, FunnelConfig } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Globe, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PublishPanelProps {
  funnel: Funnel;
  config: FunnelConfig;
  onUpdate: (funnel: Funnel) => void;
}

export function PublishPanel({ funnel, config: _config, onUpdate }: PublishPanelProps) {
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const domain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "localhost:3000";
  const funnelUrl = `${domain}/f/${funnel.slug}`;

  async function handlePublish() {
    setPublishing(true);
    const res = await fetch(`/api/funnels/${funnel.id}/publish`, { method: "POST" });
    const updated = await res.json();
    onUpdate(updated);
    setPublishing(false);
    if (res.ok) {
      toast.success("Funnel published!");
    } else {
      toast.error("Failed to publish funnel");
    }
  }

  async function handleUnpublish() {
    const res = await fetch(`/api/funnels/${funnel.id}/unpublish`, { method: "POST" });
    const updated = await res.json();
    onUpdate(updated);
    if (res.ok) {
      toast.success("Funnel unpublished");
    } else {
      toast.error("Failed to unpublish funnel");
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(`https://${funnelUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-gray-400" />
          <Label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Publication Status</Label>
        </div>

        {funnel.published ? (
          <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Published & Live</span>
              <Badge variant="secondary" className="text-[10px] ml-auto">Live</Badge>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Input
                value={funnelUrl}
                readOnly
                className="text-xs bg-white font-mono flex-1"
              />
              <Button variant="outline" size="sm" onClick={copyUrl} className="gap-1 shrink-0">
                {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <a href={`/f/${funnel.slug}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                  <ExternalLink className="w-3 h-3" />
                  View Live
                </Button>
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnpublish}
                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                Unpublish
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Your funnel is in draft mode. Publish it to make it accessible to visitors.
            </p>
            <div className="mb-3">
              <Label className="text-[11px] text-gray-400 mb-1">Your funnel URL</Label>
              <div className="flex items-center gap-1 text-sm text-gray-500 font-mono bg-white border border-gray-200 rounded-md px-3 py-2">
                {domain}/f/<span className="font-semibold text-gray-900">{funnel.slug}</span>
              </div>
            </div>
            <Button
              onClick={handlePublish}
              disabled={publishing}
              className="w-full gap-2"
            >
              {publishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Publish Funnel
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-[11px] text-gray-400 font-medium mb-1">Custom Domains</p>
        <p className="text-[11px] text-gray-400">
          Connect your own domain to this funnel. Available on Pro plan.
        </p>
        <Button variant="outline" size="sm" className="mt-2 text-xs" disabled>
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
}
