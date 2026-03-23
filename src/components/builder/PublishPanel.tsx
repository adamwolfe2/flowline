"use client";

import { useState } from "react";
import { Funnel, FunnelConfig } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Globe, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { firePublishConfetti } from "@/lib/confetti";

interface PublishPanelProps {
  funnel: Funnel;
  config: FunnelConfig;
  onUpdate: (funnel: Funnel) => void;
}

export function PublishPanel({ funnel, config: _config, onUpdate }: PublishPanelProps) {
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [customDomain, setCustomDomain] = useState(funnel.customDomain || "");
  const [savingDomain, setSavingDomain] = useState(false);
  const [checkingDns, setCheckingDns] = useState(false);
  const [dnsStatus, setDnsStatus] = useState<"unknown" | "configured" | "pending" | "error">("unknown");
  const domain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "localhost:3000";
  const funnelUrl = `${domain}/f/${funnel.slug}`;

  async function handlePublish() {
    setPublishing(true);
    const res = await fetch(`/api/funnels/${funnel.id}/publish`, { method: "POST" });
    const updated = await res.json();
    onUpdate(updated);
    setPublishing(false);
    if (res.ok) {
      firePublishConfetti();
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
            <div className="mt-4 p-3 bg-[#F9FAFB] rounded-lg">
              <p className="text-xs text-[#6B7280] mb-2">Share your funnel</p>
              <div className="flex gap-2">
                <Input value={`https://${funnelUrl}`} readOnly className="text-xs font-mono flex-1" />
                <Button variant="outline" size="sm" onClick={copyUrl}>
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
            {/* Embed Code */}
            <div className="mt-4 p-3 bg-[#F9FAFB] rounded-lg">
              <p className="text-xs text-[#6B7280] mb-2">Embed on your website</p>
              <div className="relative">
                <pre className="text-[10px] text-[#737373] font-mono bg-white border border-[#E5E7EB] rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all">
{`<iframe src="https://${funnelUrl}" width="100%" height="800" frameborder="0" style="border:none;"></iframe>`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 text-[10px] h-6 px-2"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `<iframe src="https://${funnelUrl}" width="100%" height="800" frameborder="0" style="border:none;"></iframe>`
                    );
                    toast.success("Embed code copied");
                  }}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
              <p className="text-[10px] text-[#9CA3AF] mt-2">
                Paste this code into your website&apos;s HTML to embed the funnel.
              </p>
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
            {!showPublishConfirm ? (
              <Button
                onClick={() => setShowPublishConfirm(true)}
                className="w-full gap-2"
              >
                <Globe className="w-4 h-4" />
                Publish Funnel
              </Button>
            ) : (
              <div className="mt-3 p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
                <p className="text-sm text-[#111827] font-medium mb-2">Ready to go live?</p>
                <p className="text-xs text-[#6B7280] mb-3">Your funnel will be accessible at {domain}/f/{funnel.slug}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handlePublish} disabled={publishing} className="flex-1">
                    {publishing ? "Publishing..." : "Confirm & Publish"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowPublishConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Domain */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-[11px] text-gray-500 font-medium mb-2">Custom Domain</p>
        {funnel.published ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={customDomain}
                onChange={(e) => { setCustomDomain(e.target.value); setDnsStatus("unknown"); }}
                placeholder="app.yourdomain.com"
                className="text-xs font-mono flex-1"
              />
              {funnel.customDomain && customDomain === funnel.customDomain ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={savingDomain}
                  onClick={async () => {
                    setSavingDomain(true);
                    try {
                      const res = await fetch(`/api/funnels/${funnel.id}/domain`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ domain: null }),
                      });
                      if (res.ok) {
                        const updated = await res.json();
                        onUpdate(updated);
                        setCustomDomain("");
                        setDnsStatus("unknown");
                        toast.success("Domain removed");
                      }
                    } catch { toast.error("Failed to remove domain"); }
                    setSavingDomain(false);
                  }}
                >
                  Remove
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs shrink-0"
                  disabled={savingDomain || !customDomain.trim()}
                  onClick={async () => {
                    setSavingDomain(true);
                    try {
                      const res = await fetch(`/api/funnels/${funnel.id}/domain`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ domain: customDomain }),
                      });
                      if (res.ok) {
                        const updated = await res.json();
                        onUpdate(updated);
                        setDnsStatus("pending");
                        toast.success("Domain saved. Set up your DNS records below.");
                      } else {
                        const data = await res.json();
                        toast.error(data.error || "Failed to save domain");
                      }
                    } catch { toast.error("Failed to save domain"); }
                    setSavingDomain(false);
                  }}
                >
                  {savingDomain ? "Saving..." : "Save"}
                </Button>
              )}
            </div>

            {/* DNS instructions */}
            {funnel.customDomain && (
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 space-y-2.5">
                <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">DNS Setup</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] font-mono px-1.5 py-0.5 rounded flex-shrink-0">Type</span>
                    <span className="text-[11px] font-mono font-medium text-[#111827] flex-1">CNAME</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText("CNAME"); toast.success("Copied CNAME"); }}>
                      <Copy className="w-3 h-3 text-[#9CA3AF]" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] font-mono px-1.5 py-0.5 rounded flex-shrink-0">Name</span>
                    <span className="text-[11px] font-mono font-medium text-[#111827] flex-1 truncate">{funnel.customDomain}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(funnel.customDomain || ""); toast.success("Copied domain"); }}>
                      <Copy className="w-3 h-3 text-[#9CA3AF]" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] font-mono px-1.5 py-0.5 rounded flex-shrink-0">Value</span>
                    <span className="text-[11px] font-mono font-medium text-[#111827] flex-1">cname.vercel-dns.com</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText("cname.vercel-dns.com"); toast.success("Copied value"); }}>
                      <Copy className="w-3 h-3 text-[#9CA3AF]" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7"
                    disabled={checkingDns}
                    onClick={async () => {
                      setCheckingDns(true);
                      try {
                        const res = await fetch(`/api/funnels/${funnel.id}/domain`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ domain: funnel.customDomain }),
                        });
                        if (res.ok) {
                          setDnsStatus("configured");
                          toast.success("DNS is configured correctly");
                        } else {
                          setDnsStatus("pending");
                          toast("DNS not propagated yet. This can take up to 48 hours.");
                        }
                      } catch {
                        setDnsStatus("error");
                      }
                      setCheckingDns(false);
                    }}
                  >
                    {checkingDns ? "Checking..." : "Check DNS"}
                  </Button>
                  {dnsStatus === "configured" && (
                    <span className="flex items-center gap-1 text-[10px] text-green-600">
                      <CheckCircle className="w-3 h-3" /> DNS verified
                    </span>
                  )}
                  {dnsStatus === "pending" && (
                    <span className="text-[10px] text-amber-600">Waiting for DNS propagation</span>
                  )}
                </div>
              </div>
            )}
            {!customDomain && !funnel.customDomain && (
              <p className="text-[10px] text-gray-400">
                Connect your own domain to this funnel. Requires Pro or Agency plan.
              </p>
            )}
          </div>
        ) : (
          <p className="text-[10px] text-gray-400">
            Publish your funnel first, then connect a custom domain.
          </p>
        )}
      </div>
    </div>
  );
}
