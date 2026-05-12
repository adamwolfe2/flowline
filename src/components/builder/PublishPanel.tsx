"use client";

import { useState, useEffect } from "react";
import { Funnel, FunnelConfig } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Globe, Copy, ExternalLink, Code, BarChart2, Link2, Trash2, Users, X, ChevronDown, Plus, Crosshair } from "lucide-react";
import { toast } from "sonner";
import { firePublishConfetti } from "@/lib/confetti";
import { useWorkspace, workspaceFetch } from "@/hooks/useWorkspace";
import { splitDomainName } from "@/lib/domain-name";

interface PublishPanelProps {
  funnel: Funnel;
  config: FunnelConfig;
  onUpdate: (funnel: Funnel) => void;
}

export function PublishPanel({ funnel, config: _config, onUpdate }: PublishPanelProps) {
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [widgetCopied, setWidgetCopied] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [customDomain, setCustomDomain] = useState(funnel.customDomain || "");
  const [savingDomain, setSavingDomain] = useState(false);
  const [checkingDns, setCheckingDns] = useState(false);
  const [dnsStatus, setDnsStatus] = useState<"unknown" | "configured" | "pending" | "error" | "not_attached" | "https_pending">("unknown");
  const [verificationRecords, setVerificationRecords] = useState<Array<{ type: string; domain: string; value: string }>>([]);
  const [shareToken, setShareToken] = useState<string | null>(funnel.shareToken ?? null);
  const [shareExpiresAt, setShareExpiresAt] = useState<Date | string | null>(funnel.shareTokenExpiresAt ?? null);
  const [generatingShare, setGeneratingShare] = useState(false);
  const [revokingShare, setRevokingShare] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  // Tracking links
  type TrackingLink = { id: string; name: string; source: string; medium: string; campaign: string };
  const [trackingLinks, setTrackingLinks] = useState<TrackingLink[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(`tracking-links-${funnel.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [showLinkBuilder, setShowLinkBuilder] = useState(false);
  const [newLink, setNewLink] = useState({ name: "", source: "", medium: "", campaign: "" });
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Persist tracking links
  useEffect(() => {
    try {
      localStorage.setItem(`tracking-links-${funnel.id}`, JSON.stringify(trackingLinks));
    } catch { /* storage full or unavailable */ }
  }, [trackingLinks, funnel.id]);

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "localhost:3000";
  const liveDomain = funnel.customDomain || platformDomain;
  const funnelUrl = funnel.customDomain ? liveDomain : `${platformDomain}/f/${funnel.slug}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${platformDomain}`;
  const shareUrl = shareToken ? `${appUrl}/analytics/shared/${shareToken}` : null;

  // Client assignment
  const { activeTeamId, isTeamContext } = useWorkspace();
  const [clients, setClients] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [savingClient, setSavingClient] = useState(false);

  // Fetch domain verification status on load if domain is set
  useEffect(() => {
    if (!funnel.customDomain) return;
    fetch(`/api/funnels/${funnel.id}/domain`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        if (data.verified) {
          setDnsStatus("configured");
          setVerificationRecords([]);
          return;
        }
        switch (data.reason) {
          case "not_attached_to_project":
            setDnsStatus("not_attached");
            setVerificationRecords([]);
            break;
          case "https_not_ready":
            setDnsStatus("https_pending");
            setVerificationRecords([]);
            break;
          case "verification_pending":
            setDnsStatus("pending");
            setVerificationRecords(data.verification ?? []);
            break;
          default:
            setDnsStatus("pending");
            if (data.verification?.length) setVerificationRecords(data.verification);
        }
      })
      .catch(() => {});
  }, [funnel.customDomain, funnel.id]);

  useEffect(() => {
    if (!activeTeamId) return;
    fetch(`/api/teams/${activeTeamId}/clients`)
      .then(r => r.ok ? r.json() : { clients: [] })
      .then(data => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.clients) ? data.clients : []);
        setClients(list);
      })
      .catch(() => setClients([]));
  }, [activeTeamId]);

  const assignedClient = funnel.clientId
    ? clients.find(c => c.id === funnel.clientId) ?? null
    : null;

  async function handleAssignClient(clientId: string) {
    setSavingClient(true);
    setClientDropdownOpen(false);
    try {
      const res = await workspaceFetch(`/api/funnels/${funnel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        toast.success("Client assigned");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to assign client");
      }
    } catch {
      toast.error("Failed to assign client");
    } finally {
      setSavingClient(false);
    }
  }

  async function handleRemoveClient() {
    setSavingClient(true);
    try {
      const res = await workspaceFetch(`/api/funnels/${funnel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: null }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        toast.success("Client removed");
      } else {
        toast.error("Failed to remove client");
      }
    } catch {
      toast.error("Failed to remove client");
    } finally {
      setSavingClient(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const res = await fetch(`/api/funnels/${funnel.id}/publish`, { method: "POST" });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        firePublishConfetti(_config.brand?.primaryColor);
        toast.success("Funnel published!");
      } else {
        toast.error("Failed to publish funnel");
      }
    } catch {
      toast.error("Failed to publish funnel");
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    try {
      const res = await fetch(`/api/funnels/${funnel.id}/unpublish`, { method: "POST" });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        toast.success("Funnel unpublished");
      } else {
        toast.error("Failed to unpublish funnel");
      }
    } catch {
      toast.error("Failed to unpublish funnel");
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(`https://${funnelUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleGenerateShareLink() {
    setGeneratingShare(true);
    try {
      const res = await fetch(`/api/funnels/${funnel.id}/share`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setShareToken(data.shareToken);
        setShareExpiresAt(data.shareTokenExpiresAt);
        toast.success("Share link generated");
      } else {
        toast.error("Failed to generate share link");
      }
    } catch {
      toast.error("Failed to generate share link");
    } finally {
      setGeneratingShare(false);
    }
  }

  async function handleRevokeShareLink() {
    setRevokingShare(true);
    try {
      const res = await fetch(`/api/funnels/${funnel.id}/share`, { method: "DELETE" });
      if (res.ok) {
        setShareToken(null);
        setShareExpiresAt(null);
        toast.success("Share link revoked");
      } else {
        toast.error("Failed to revoke share link");
      }
    } catch {
      toast.error("Failed to revoke share link");
    } finally {
      setRevokingShare(false);
    }
  }

  function copyShareLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
    toast.success("Share link copied");
  }

  function buildTrackedUrl(link: { source: string; medium: string; campaign: string }): string {
    const base = `https://${funnelUrl}`;
    const params = new URLSearchParams();
    if (link.source) params.set("utm_source", link.source);
    if (link.medium) params.set("utm_medium", link.medium);
    if (link.campaign) params.set("utm_campaign", link.campaign);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  function addTrackingLink() {
    if (!newLink.source.trim()) return;
    const link: TrackingLink = {
      id: crypto.randomUUID(),
      name: newLink.name || `${newLink.source} / ${newLink.medium || "link"}`,
      source: newLink.source,
      medium: newLink.medium,
      campaign: newLink.campaign,
    };
    setTrackingLinks(prev => [...prev, link]);
    setNewLink({ name: "", source: "", medium: "", campaign: "" });
    setShowLinkBuilder(false);
    toast.success("Tracking link created");
  }

  function removeTrackingLink(id: string) {
    setTrackingLinks(prev => prev.filter((l) => l.id !== id));
  }

  function copyTrackingLink(link: TrackingLink) {
    const url = buildTrackedUrl(link);
    navigator.clipboard.writeText(url).catch(() => {
      // Fallback for restricted contexts
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    });
    setCopiedLinkId(link.id);
    setTimeout(() => setCopiedLinkId(null), 2000);
    toast.success("Tracking link copied");
  }

  function getDaysUntilExpiry(expiresAt: Date | string | null): number | null {
    if (!expiresAt) return null;
    const ms = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="space-y-5">
      {/* Client Assignment — team workspace only */}
      {isTeamContext && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3.5 h-3.5 text-gray-500" />
            <p className="text-[11px] text-gray-500 font-medium">Client</p>
          </div>

          {assignedClient ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-900">{assignedClient.name}</span>
                <span className="text-[10px] text-gray-400">{assignedClient.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] h-6 px-2 text-gray-500 hover:text-gray-700"
                  disabled={savingClient}
                  onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                >
                  Change
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                  disabled={savingClient}
                  onClick={handleRemoveClient}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-gray-400 mb-2">No client assigned</p>
          )}

          {(!assignedClient || clientDropdownOpen) && clients.length > 0 && (
            <div className="relative mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between text-xs h-8"
                onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                disabled={savingClient}
              >
                <span className="text-gray-500">
                  {savingClient ? "Saving..." : "Select a client"}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Button>
              {clientDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => handleAssignClient(client.id)}
                    >
                      <span className="text-xs font-medium text-gray-900 block">{client.name}</span>
                      <span className="text-[10px] text-gray-400">{client.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!assignedClient && clients.length === 0 && isTeamContext && (
            <p className="text-[10px] text-gray-400">
              No clients yet. Add clients in Settings to assign them here.
            </p>
          )}
        </div>
      )}

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
              <a href={`https://${funnelUrl}`} target="_blank" rel="noopener noreferrer" className="flex-1">
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
{`<iframe src="https://${funnelUrl}?embed=true" width="100%" height="800" frameborder="0" style="border:none;"></iframe>`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 text-[10px] h-6 px-2"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `<iframe src="https://${funnelUrl}?embed=true" width="100%" height="800" frameborder="0" style="border:none;"></iframe>`
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
            {/* Quiz Widget Embed */}
            <div className="mt-4 p-3 bg-[#F9FAFB] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-3.5 h-3.5 text-[#6B7280]" />
                <p className="text-xs text-[#6B7280] font-medium">Quiz Widget Embed</p>
              </div>
              <div className="relative">
                <pre className="text-[10px] text-[#737373] font-mono bg-white border border-[#E5E7EB] rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all">
{`<div id="myvsl-quiz-${funnel.id}"></div>
<script src="https://${platformDomain}/api/embed/${funnel.id}/script.js" async></script>`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 text-[10px] h-6 px-2"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `<div id="myvsl-quiz-${funnel.id}"></div>\n<script src="https://${platformDomain}/api/embed/${funnel.id}/script.js" async></script>`
                    );
                    setWidgetCopied(true);
                    setTimeout(() => setWidgetCopied(false), 2000);
                    toast.success("Widget code copied");
                  }}
                >
                  {widgetCopied ? <CheckCircle className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {widgetCopied ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="text-[10px] text-[#9CA3AF] mt-2">
                Paste this on any website to embed your quiz as an auto-resizing widget.
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
                {platformDomain}/f/<span className="font-semibold text-gray-900">{funnel.slug}</span>
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
                <p className="text-xs text-[#6B7280] mb-3">Your funnel will be accessible at {platformDomain}/f/{funnel.slug}</p>
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

      {/* Analytics Sharing */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="w-3.5 h-3.5 text-gray-500" />
          <p className="text-[11px] text-gray-500 font-medium">Share Analytics</p>
        </div>
        <p className="text-[10px] text-gray-400 mb-3">
          Generate a read-only link so clients can view this funnel&apos;s analytics.
        </p>

        {shareToken && shareUrl ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="text-[11px] font-mono flex-1 bg-white"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
                className="shrink-0 gap-1 text-xs"
              >
                {shareLinkCopied ? <CheckCircle className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
                {shareLinkCopied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray-400">
                {getDaysUntilExpiry(shareExpiresAt) !== null
                  ? `Expires in ~${getDaysUntilExpiry(shareExpiresAt)} days`
                  : "Expires in ~30 days"}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRevokeShareLink}
                disabled={revokingShare}
                className="text-[10px] h-6 text-red-500 hover:text-red-700 hover:bg-red-50 gap-1"
              >
                <Trash2 className="w-3 h-3" />
                {revokingShare ? "Revoking..." : "Revoke Access"}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateShareLink}
            disabled={generatingShare}
            className="text-xs gap-1.5"
          >
            <Link2 className="w-3.5 h-3.5" />
            {generatingShare ? "Generating..." : "Generate Share Link"}
          </Button>
        )}
      </div>

      {/* Tracking Links */}
      {funnel.published && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5 text-gray-500" />
              <p className="text-[11px] text-gray-500 font-medium">Tracking Links</p>
            </div>
            {trackingLinks.length > 0 && !showLinkBuilder && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] h-6 px-2 gap-1"
                onClick={() => setShowLinkBuilder(true)}
              >
                <Plus className="w-3 h-3" />
                Add
              </Button>
            )}
          </div>

          {trackingLinks.length === 0 && !showLinkBuilder && (
            <div className="text-center py-3">
              <p className="text-[10px] text-gray-400 mb-2">
                Create tagged links to track where your leads come from — ads, emails, social posts, etc.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => setShowLinkBuilder(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                Create Tracking Link
              </Button>
            </div>
          )}

          {/* Existing links */}
          {trackingLinks.length > 0 && (
            <div className="space-y-2 mb-3">
              {trackingLinks.map((link) => (
                <div key={link.id} className="bg-white border border-[#E5E7EB] rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-900">{link.name}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyTrackingLink(link)}
                      >
                        {copiedLinkId === link.id ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        onClick={() => removeTrackingLink(link.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {link.source && (
                      <span className="text-[9px] bg-[#2D6A4F]/10 text-[#2D6A4F] px-1.5 py-0.5 rounded font-medium">{link.source}</span>
                    )}
                    {link.medium && (
                      <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{link.medium}</span>
                    )}
                    {link.campaign && (
                      <span className="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-medium">{link.campaign}</span>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-400 font-mono truncate">{buildTrackedUrl(link)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Link builder form */}
          {showLinkBuilder && (
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 space-y-2.5">
              <div>
                <Label className="text-[10px] text-gray-500 mb-1">Link Name</Label>
                <Input
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  placeholder='e.g. "LinkedIn Spring Campaign"'
                  className="text-xs h-8"
                />
              </div>
              <div>
                <Label className="text-[10px] text-gray-500 mb-1">Source <span className="text-red-400">*</span></Label>
                <Input
                  value={newLink.source}
                  onChange={(e) => setNewLink({ ...newLink, source: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                  placeholder="e.g. linkedin, meta, google, email"
                  className="text-xs h-8 font-mono"
                />
                <p className="text-[9px] text-gray-400 mt-0.5">Where the traffic comes from</p>
              </div>
              <div>
                <Label className="text-[10px] text-gray-500 mb-1">Medium</Label>
                <Input
                  value={newLink.medium}
                  onChange={(e) => setNewLink({ ...newLink, medium: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                  placeholder="e.g. cpc, email, social, webinar"
                  className="text-xs h-8 font-mono"
                />
                <p className="text-[9px] text-gray-400 mt-0.5">How the traffic gets here (ad, email, post)</p>
              </div>
              <div>
                <Label className="text-[10px] text-gray-500 mb-1">Campaign</Label>
                <Input
                  value={newLink.campaign}
                  onChange={(e) => setNewLink({ ...newLink, campaign: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                  placeholder="e.g. spring_promo, webinar_replay"
                  className="text-xs h-8 font-mono"
                />
                <p className="text-[9px] text-gray-400 mt-0.5">The specific campaign or promotion</p>
              </div>

              {/* Live preview */}
              {newLink.source && (
                <div className="bg-[#F9FAFB] rounded p-2">
                  <p className="text-[9px] text-gray-500 mb-1">Preview</p>
                  <p className="text-[9px] font-mono text-gray-600 break-all">
                    {buildTrackedUrl(newLink)}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  className="flex-1 text-xs h-8"
                  disabled={!newLink.source.trim()}
                  onClick={addTrackingLink}
                >
                  Create Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => { setShowLinkBuilder(false); setNewLink({ name: "", source: "", medium: "", campaign: "" }); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {trackingLinks.length > 0 && (
            <p className="text-[9px] text-gray-400 mt-2">
              Leads from these links will appear in your analytics under &quot;Lead Sources&quot;.
            </p>
          )}
        </div>
      )}

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
                        const data = await res.json();
                        const { verification, verified, ...funnelData } = data;
                        onUpdate(funnelData);
                        if (verification?.length) setVerificationRecords(verification);
                        // Start in "pending" — the Check DNS button will refine
                        // to configured / https_pending / not_attached. Saving
                        // "verified=true" immediately misled users when the
                        // server failed to register with Vercel silently.
                        setDnsStatus(verified ? "https_pending" : "pending");
                        toast.success("Domain saved. Add the DNS record below, then click Check DNS.");
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
            {funnel.customDomain && (() => {
              const { host: cnameHost } = splitDomainName(funnel.customDomain);
              return (
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 space-y-3">
                <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">DNS Setup</p>
                <p className="text-[10px] text-[#6B7280]">Add the record below at your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.).</p>

                {/* Record 1: CNAME */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-[#374151]">Record 1 — CNAME</p>
                  <div className="space-y-1.5 bg-[#F9FAFB] rounded p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] font-mono px-1.5 py-0.5 rounded flex-shrink-0 w-10 text-center">Type</span>
                      <span className="text-[11px] font-mono font-medium text-[#111827] flex-1">CNAME</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText("CNAME"); toast.success("Copied"); }}>
                        <Copy className="w-3 h-3 text-[#9CA3AF]" />
                      </Button>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] font-mono px-1.5 py-0.5 rounded flex-shrink-0 w-10 text-center mt-0.5">Name</span>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-medium text-[#111827] flex-1 truncate">{cnameHost}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0" onClick={() => { navigator.clipboard.writeText(cnameHost); toast.success("Copied"); }}>
                            <Copy className="w-3 h-3 text-[#9CA3AF]" />
                          </Button>
                        </div>
                        <p className="text-[9px] text-[#9CA3AF] leading-tight">
                          Use <span className="font-mono text-[#6B7280]">{cnameHost}</span> in most providers (Cloudflare, GoDaddy, Namecheap).
                          {" "}If yours wants the full hostname, use <span className="font-mono text-[#6B7280] break-all">{funnel.customDomain}</span> instead.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] font-mono px-1.5 py-0.5 rounded flex-shrink-0 w-10 text-center">Value</span>
                      <span className="text-[11px] font-mono font-medium text-[#111827] flex-1">cname.vercel-dns.com</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText("cname.vercel-dns.com"); toast.success("Copied"); }}>
                        <Copy className="w-3 h-3 text-[#9CA3AF]" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Record 2: TXT verification */}
                {verificationRecords.length > 0 ? (
                  verificationRecords.map((rec, i) => {
                    const recHost = splitDomainName(rec.domain).host;
                    return (
                    <div key={i} className="space-y-1.5">
                      <p className="text-[10px] font-semibold text-[#374151]">Record {i + 2} — {rec.type} (Verification)</p>
                      <div className="space-y-1.5 bg-[#FFF7ED] rounded p-2 border border-amber-200">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] font-mono px-1.5 py-0.5 rounded flex-shrink-0 w-10 text-center">Type</span>
                          <span className="text-[11px] font-mono font-medium text-[#111827] flex-1">{rec.type}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(rec.type); toast.success("Copied"); }}>
                            <Copy className="w-3 h-3 text-[#9CA3AF]" />
                          </Button>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] font-mono px-1.5 py-0.5 rounded flex-shrink-0 w-10 text-center mt-0.5">Name</span>
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono font-medium text-[#111827] flex-1 truncate">{recHost}</span>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0" onClick={() => { navigator.clipboard.writeText(recHost); toast.success("Copied"); }}>
                                <Copy className="w-3 h-3 text-[#9CA3AF]" />
                              </Button>
                            </div>
                            <p className="text-[9px] text-[#9CA3AF] leading-tight">
                              Or full hostname: <span className="font-mono text-[#6B7280] break-all">{rec.domain}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] font-mono px-1.5 py-0.5 rounded flex-shrink-0 w-10 text-center">Value</span>
                          <span className="text-[11px] font-mono font-medium text-[#111827] flex-1 break-all text-[10px]">{rec.value}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0" onClick={() => { navigator.clipboard.writeText(rec.value); toast.success("Copied"); }}>
                            <Copy className="w-3 h-3 text-[#9CA3AF]" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    );
                  })
                ) : dnsStatus !== "configured" ? (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-[#374151]">Record 2 — TXT (Verification)</p>
                    <p className="text-[10px] text-[#6B7280] bg-[#F9FAFB] rounded p-2">
                      Click &quot;Check DNS&quot; to load the verification record from Vercel.
                    </p>
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7"
                    disabled={checkingDns}
                    onClick={async () => {
                      setCheckingDns(true);
                      try {
                        const res = await fetch(`/api/funnels/${funnel.id}/domain`);
                        if (res.ok) {
                          const data = await res.json();
                          if (data.verified) {
                            setDnsStatus("configured");
                            setVerificationRecords([]);
                            toast.success("Domain verified — HTTPS is live");
                          } else {
                            switch (data.reason) {
                              case "not_attached_to_project":
                                setDnsStatus("not_attached");
                                setVerificationRecords([]);
                                toast.error("Domain isn't registered on the server. Click Remove, then Save to re-register.");
                                break;
                              case "https_not_ready":
                                setDnsStatus("https_pending");
                                setVerificationRecords([]);
                                toast("DNS is correct. SSL cert is still being issued — try again in 30-60 seconds.");
                                break;
                              case "verification_pending":
                                setDnsStatus("pending");
                                if (data.verification?.length) setVerificationRecords(data.verification);
                                toast("Verification pending. Add the TXT record below, then check again.");
                                break;
                              case "dns_not_propagated":
                              default:
                                setDnsStatus("pending");
                                toast("DNS not propagated yet. This can take up to 48 hours.");
                            }
                          }
                        } else {
                          setDnsStatus("error");
                          toast.error("Failed to check domain status");
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
                      <CheckCircle className="w-3 h-3" /> Verified — HTTPS ready
                    </span>
                  )}
                  {dnsStatus === "pending" && (
                    <span className="text-[10px] text-amber-600">Waiting for DNS</span>
                  )}
                  {dnsStatus === "https_pending" && (
                    <span className="text-[10px] text-amber-600">DNS ok — waiting for SSL cert (30–60s)</span>
                  )}
                  {dnsStatus === "not_attached" && (
                    <span className="text-[10px] text-red-600">Domain not registered — click Remove then Save to retry</span>
                  )}
                </div>
              </div>
              );
            })()}
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
