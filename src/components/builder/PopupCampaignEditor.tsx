"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Funnel } from "@/types";
import type {
  PopupTriggerConfig,
  PopupSuppressionConfig,
  PopupStyleConfig,
  PopupDisplayMode,
  PopupPosition,
  PopupStatus,
} from "@/types";
import { PopupFromUrlWizard } from "./PopupFromUrlWizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Zap,
  Plus,
  Trash2,
  Copy,
  Check,
  Monitor,
  PanelRight,
  Maximize2,
  MousePointerClick,
  Timer,
  ArrowDownToLine,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Eye,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ──

interface Campaign {
  id: string;
  funnelId: string;
  userId: string;
  name: string;
  status: PopupStatus;
  displayMode: PopupDisplayMode;
  position: PopupPosition;
  triggers: PopupTriggerConfig;
  targeting: { pageUrls: string[]; utmSources: string[]; deviceTypes: string[]; newVisitorsOnly: boolean };
  suppression: PopupSuppressionConfig;
  styleOverrides: PopupStyleConfig;
  priority: number;
  createdAt: string;
  updatedAt: string;
  funnelPublished?: boolean;
}

interface CampaignStats {
  totalImpressions: number;
  totalShown: number;
  totalDismissed: number;
  totalEngaged: number;
  totalConverted: number;
  engagementRate: number;
  conversionRate: number;
  dismissRate: number;
}

interface PopupPreviewSettings {
  displayMode: "modal" | "slide_in" | "full_screen";
  position: "center" | "bottom_left" | "bottom_right";
  styleOverrides: { overlayOpacity: number; borderRadius: number; animation: string; maxWidth: number };
}

interface PopupCampaignEditorProps {
  funnel: Funnel;
  onPreviewChange?: (settings: PopupPreviewSettings | null) => void;
}

// ── Helpers ──

const STATUS_LABELS: Record<PopupStatus, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
};

const STATUS_COLORS: Record<PopupStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
};

const DISPLAY_MODES: { value: PopupDisplayMode; label: string; icon: typeof Monitor }[] = [
  { value: "modal", label: "Modal", icon: Monitor },
  { value: "slide_in", label: "Slide In", icon: PanelRight },
  { value: "full_screen", label: "Full Screen", icon: Maximize2 },
];

const POSITIONS: { value: PopupPosition; label: string }[] = [
  { value: "bottom_left", label: "Bottom Left" },
  { value: "bottom_right", label: "Bottom Right" },
];

const ANIMATIONS: { value: string; label: string }[] = [
  { value: "fade", label: "Fade" },
  { value: "slide_up", label: "Slide Up" },
  { value: "scale", label: "Scale" },
];

// ── Component ──

export function PopupCampaignEditor({ funnel, onPreviewChange }: PopupCampaignEditorProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [scriptCopied, setScriptCopied] = useState(false);
  const [showUrlWizard, setShowUrlWizard] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    triggers: false,
    suppression: false,
    style: false,
    install: false,
  });

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) ?? null;

  // ── Fetch campaigns ──

  // Notify parent of preview settings when selected campaign changes
  useEffect(() => {
    if (!onPreviewChange) return;
    if (!selectedCampaign) {
      // Show default modal preview if any campaigns exist
      const first = campaigns[0];
      if (first) {
        onPreviewChange({
          displayMode: first.displayMode,
          position: first.position,
          styleOverrides: first.styleOverrides,
        });
      } else {
        onPreviewChange(null);
      }
      return;
    }
    onPreviewChange({
      displayMode: selectedCampaign.displayMode,
      position: selectedCampaign.position,
      styleOverrides: selectedCampaign.styleOverrides,
    });
  }, [selectedCampaign, campaigns, onPreviewChange]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/popup/campaigns")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Campaign[]) => {
        const filtered = Array.isArray(data)
          ? data.filter((c) => c.funnelId === funnel.id)
          : [];
        setCampaigns(filtered);
      })
      .catch(() => {
        toast.error("Failed to load popup campaigns");
      })
      .finally(() => setLoading(false));
  }, [funnel.id]);

  // ── Fetch stats for selected campaign ──

  useEffect(() => {
    if (!selectedCampaignId) {
      setStats(null);
      return;
    }
    setLoadingStats(true);
    fetch(`/api/popup/campaigns/${selectedCampaignId}/stats?timeRange=30d`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, [selectedCampaignId]);

  // ── Debounced save ──

  const debouncedSave = useCallback(
    (campaignId: string, updates: Partial<Campaign>) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          const res = await fetch(`/api/popup/campaigns/${campaignId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });
          if (!res.ok) {
            const data = await res.json();
            toast.error(data.error || "Failed to save changes");
          }
        } catch {
          toast.error("Failed to save changes");
        } finally {
          setSaving(false);
        }
      }, 500);
    },
    [],
  );

  // ── Update campaign locally + trigger save ──

  const updateCampaign = useCallback(
    (campaignId: string, updates: Partial<Campaign>) => {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, ...updates } : c)),
      );
      debouncedSave(campaignId, updates);
    },
    [debouncedSave],
  );

  // ── Create campaign ──

  async function handleCreate() {
    if (!funnel.published) {
      toast.error("Publish your funnel before creating a popup campaign");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/popup/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funnelId: funnel.id,
          name: `Popup Campaign ${campaigns.length + 1}`,
        }),
      });
      if (res.ok) {
        const campaign: Campaign = await res.json();
        setCampaigns((prev) => [campaign, ...prev]);
        setSelectedCampaignId(campaign.id);
        toast.success("Campaign created");
      } else if (res.status === 403) {
        const data = await res.json();
        if (data.upgrade) {
          toast.error(data.error || "Upgrade your plan to create popup campaigns");
        } else {
          toast.error(data.error || "Not authorized");
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create campaign");
      }
    } catch {
      toast.error("Failed to create campaign");
    } finally {
      setCreating(false);
    }
  }

  // ── Delete campaign ──

  async function handleDelete(campaignId: string) {
    try {
      const res = await fetch(`/api/popup/campaigns/${campaignId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
        if (selectedCampaignId === campaignId) {
          setSelectedCampaignId(null);
        }
        toast.success("Campaign deleted");
      } else {
        toast.error("Failed to delete campaign");
      }
    } catch {
      toast.error("Failed to delete campaign");
    }
    setDeleteConfirmId(null);
  }

  // ── Activate / Pause ──

  async function handleActivate(campaignId: string) {
    try {
      const res = await fetch(`/api/popup/campaigns/${campaignId}/activate`, {
        method: "POST",
      });
      if (res.ok) {
        const updated: Campaign = await res.json();
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaignId ? { ...c, status: updated.status } : c)),
        );
        toast.success("Campaign activated");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to activate campaign");
      }
    } catch {
      toast.error("Failed to activate campaign");
    }
  }

  async function handlePause(campaignId: string) {
    try {
      const res = await fetch(`/api/popup/campaigns/${campaignId}/pause`, {
        method: "POST",
      });
      if (res.ok) {
        const updated: Campaign = await res.json();
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaignId ? { ...c, status: updated.status } : c)),
        );
        toast.success("Campaign paused");
      } else {
        toast.error("Failed to pause campaign");
      }
    } catch {
      toast.error("Failed to pause campaign");
    }
  }

  // ── URL wizard completion ──

  function handleWizardComplete(result: { funnelId: string; funnelSlug: string; campaignId: string; brandName: string }) {
    setShowUrlWizard(false);
    // Redirect to the new funnel's builder with popup tab open
    window.location.href = `/builder/${result.funnelId}?tab=popup`;
  }

  // ── Section toggle ──

  function toggleSection(key: string) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // ── Loading state ──

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  // ── Render ──

  return (
    <div className="space-y-5">
      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Delete Campaign?</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              This will permanently delete this popup campaign and all its impression data. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs bg-red-500 hover:bg-red-600 text-white border-0"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Delete Campaign
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#2D6A4F]" />
          <h3 className="text-sm font-semibold text-gray-900">Popup Campaigns</h3>
          {saving && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowUrlWizard(true)}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            disabled={showUrlWizard}
          >
            <Sparkles className="w-3.5 h-3.5" />
            From URL
          </Button>
          <Button
            onClick={handleCreate}
            size="sm"
            className="gap-1.5 text-xs"
            disabled={creating}
          >
            {creating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            This Funnel
          </Button>
        </div>
      </div>

      {/* URL Wizard */}
      {showUrlWizard && (
        <PopupFromUrlWizard
          onComplete={handleWizardComplete}
          onCancel={() => setShowUrlWizard(false)}
        />
      )}

      {/* Empty state */}
      {campaigns.length === 0 && !showUrlWizard && (
        <div className="text-center py-8">
          <Zap className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">Create your first popup</p>
          <p className="text-xs text-gray-400 mb-5 max-w-[280px] mx-auto leading-relaxed">
            Show interactive quiz popups on any website. Capture leads with exit intent, scroll triggers, and more.
          </p>
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={() => setShowUrlWizard(true)}
              className="gap-2 bg-[#2D6A4F] hover:bg-[#245840] text-white"
            >
              <Sparkles className="w-4 h-4" />
              Generate from website URL
            </Button>
            <span className="text-[11px] text-gray-400">or</span>
            <button
              onClick={handleCreate}
              disabled={creating || !funnel.published}
              className="text-xs text-[#2D6A4F] hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              {funnel.published
                ? "Use this funnel as a popup"
                : "Publish this funnel first to use it as a popup"}
            </button>
          </div>
        </div>
      )}

      {/* Info banner — only show when campaigns exist */}
      {campaigns.length > 0 && !showUrlWizard && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-700 font-medium mb-1">Exit-Intent Popups</p>
          <p className="text-[11px] text-blue-600 leading-relaxed">
            Show your funnel as a popup on any website. Configure triggers like exit intent,
            scroll depth, and time delay to capture visitors before they leave.
          </p>
        </div>
      )}

      {/* Campaign list */}
      {campaigns.length > 0 && (
        <div className="space-y-2">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`border rounded-lg transition-colors cursor-pointer ${
                selectedCampaignId === campaign.id
                  ? "border-[#2D6A4F] bg-green-50/30"
                  : "border-[#E5E7EB] hover:border-gray-300"
              }`}
            >
              {/* Campaign card header */}
              <div
                className="flex items-center justify-between p-3"
                onClick={() =>
                  setSelectedCampaignId(
                    selectedCampaignId === campaign.id ? null : campaign.id,
                  )
                }
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium text-gray-900 truncate">
                    {campaign.name}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      STATUS_COLORS[campaign.status]
                    }`}
                  >
                    {STATUS_LABELS[campaign.status]}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {DISPLAY_MODES.find((m) => m.value === campaign.displayMode)?.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(campaign.id);
                    }}
                    className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                    aria-label="Delete campaign"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {selectedCampaignId === campaign.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded editor */}
              {selectedCampaignId === campaign.id && selectedCampaign && (
                <div className="border-t border-[#E5E7EB] px-3 pb-3 space-y-4">
                  {/* Stats summary */}
                  {campaign.status !== "draft" && (
                    <div className="pt-3">
                      {loadingStats ? (
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Loading stats...
                        </div>
                      ) : stats ? (
                        <div className="flex items-center gap-4 text-[10px]">
                          <span className="flex items-center gap-1 text-gray-500">
                            <Eye className="w-3 h-3" />
                            {stats.totalShown.toLocaleString()} shown
                          </span>
                          <span className="flex items-center gap-1 text-gray-500">
                            <MousePointerClick className="w-3 h-3" />
                            {stats.totalEngaged.toLocaleString()} engaged
                          </span>
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <BarChart3 className="w-3 h-3" />
                            {stats.conversionRate}% CVR
                          </span>
                          <span className="text-gray-400">
                            {stats.totalDismissed.toLocaleString()} dismissed
                          </span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 pt-1">No impression data yet</p>
                      )}
                    </div>
                  )}

                  {/* Section A: General */}
                  <CollapsibleSection
                    title="General"
                    expanded={expandedSections.general}
                    onToggle={() => toggleSection("general")}
                  >
                    <div className="space-y-3">
                      {/* Campaign name */}
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Campaign Name</Label>
                        <Input
                          value={selectedCampaign.name}
                          onChange={(e) =>
                            updateCampaign(selectedCampaign.id, { name: e.target.value })
                          }
                          className="text-sm mt-1"
                          maxLength={100}
                          placeholder="My Popup Campaign"
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                          Status
                        </Label>
                        <div className="flex gap-1.5">
                          {(["draft", "active", "paused"] as PopupStatus[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                if (s === "active") {
                                  handleActivate(selectedCampaign.id);
                                } else if (s === "paused") {
                                  handlePause(selectedCampaign.id);
                                }
                                // draft status can only be set via PATCH for non-paused campaigns
                                // The API prevents paused -> draft, so we handle active/paused via endpoints
                              }}
                              disabled={
                                selectedCampaign.status === s ||
                                (s === "draft" && selectedCampaign.status === "paused")
                              }
                              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                                selectedCampaign.status === s
                                  ? s === "active"
                                    ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                                    : s === "paused"
                                      ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300"
                                      : "bg-gray-200 text-gray-700 ring-1 ring-gray-300"
                                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                              } disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                              {STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>
                        {selectedCampaign.status === "paused" && (
                          <p className="text-[11px] text-gray-400 mt-1">
                            Paused campaigns cannot return to draft status.
                          </p>
                        )}
                      </div>

                      {/* Display mode */}
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                          Display Mode
                        </Label>
                        <div className="flex gap-1.5">
                          {DISPLAY_MODES.map(({ value, label, icon: Icon }) => (
                            <button
                              key={value}
                              onClick={() =>
                                updateCampaign(selectedCampaign.id, { displayMode: value })
                              }
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors border ${
                                selectedCampaign.displayMode === value
                                  ? "border-[#2D6A4F] bg-green-50 text-[#2D6A4F]"
                                  : "border-[#E5E7EB] text-gray-500 hover:border-gray-300"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Position (slide_in only) */}
                      {selectedCampaign.displayMode === "slide_in" && (
                        <div>
                          <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                            Position
                          </Label>
                          <div className="flex gap-1.5">
                            {POSITIONS.map(({ value, label }) => (
                              <button
                                key={value}
                                onClick={() =>
                                  updateCampaign(selectedCampaign.id, { position: value })
                                }
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors border ${
                                  selectedCampaign.position === value
                                    ? "border-[#2D6A4F] bg-green-50 text-[#2D6A4F]"
                                    : "border-[#E5E7EB] text-gray-500 hover:border-gray-300"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleSection>

                  {/* Section B: Triggers */}
                  <CollapsibleSection
                    title="Triggers"
                    expanded={expandedSections.triggers}
                    onToggle={() => toggleSection("triggers")}
                  >
                    <div className="space-y-4">
                      {/* Exit intent */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <MousePointerClick className="w-3.5 h-3.5 text-gray-400" />
                            <Label className="text-xs font-medium text-gray-700">
                              Exit Intent
                            </Label>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Show popup when the cursor moves toward closing the tab
                          </p>
                        </div>
                        <Switch
                          checked={selectedCampaign.triggers.exitIntent}
                          onCheckedChange={(checked) =>
                            updateCampaign(selectedCampaign.id, {
                              triggers: {
                                ...selectedCampaign.triggers,
                                exitIntent: Boolean(checked),
                              },
                            })
                          }
                          size="sm"
                        />
                      </div>

                      {/* Time delay */}
                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Timer className="w-3.5 h-3.5 text-gray-400" />
                              <Label className="text-xs font-medium text-gray-700">
                                Time Delay
                              </Label>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Show popup after the visitor has been on the page
                            </p>
                          </div>
                          <Switch
                            checked={selectedCampaign.triggers.timeDelay !== null}
                            onCheckedChange={(checked) =>
                              updateCampaign(selectedCampaign.id, {
                                triggers: {
                                  ...selectedCampaign.triggers,
                                  timeDelay: checked ? 5 : null,
                                },
                              })
                            }
                            size="sm"
                          />
                        </div>
                        {selectedCampaign.triggers.timeDelay !== null && (
                          <div className="flex items-center gap-2 mt-2 ml-5">
                            <Input
                              type="number"
                              value={selectedCampaign.triggers.timeDelay}
                              onChange={(e) =>
                                updateCampaign(selectedCampaign.id, {
                                  triggers: {
                                    ...selectedCampaign.triggers,
                                    timeDelay: Math.max(1, parseInt(e.target.value) || 1),
                                  },
                                })
                              }
                              className="w-20 text-xs h-7"
                              min={1}
                              max={300}
                            />
                            <span className="text-[11px] text-gray-400">seconds</span>
                          </div>
                        )}
                      </div>

                      {/* Scroll depth */}
                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <ArrowDownToLine className="w-3.5 h-3.5 text-gray-400" />
                              <Label className="text-xs font-medium text-gray-700">
                                Scroll Depth
                              </Label>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Show popup when the visitor scrolls past a threshold
                            </p>
                          </div>
                          <Switch
                            checked={selectedCampaign.triggers.scrollDepth !== null}
                            onCheckedChange={(checked) =>
                              updateCampaign(selectedCampaign.id, {
                                triggers: {
                                  ...selectedCampaign.triggers,
                                  scrollDepth: checked ? 50 : null,
                                },
                              })
                            }
                            size="sm"
                          />
                        </div>
                        {selectedCampaign.triggers.scrollDepth !== null && (
                          <div className="flex items-center gap-2 mt-2 ml-5">
                            <Input
                              type="number"
                              value={selectedCampaign.triggers.scrollDepth}
                              onChange={(e) =>
                                updateCampaign(selectedCampaign.id, {
                                  triggers: {
                                    ...selectedCampaign.triggers,
                                    scrollDepth: Math.min(
                                      100,
                                      Math.max(1, parseInt(e.target.value) || 1),
                                    ),
                                  },
                                })
                              }
                              className="w-20 text-xs h-7"
                              min={1}
                              max={100}
                            />
                            <span className="text-[11px] text-gray-400">% of page</span>
                          </div>
                        )}
                      </div>

                      {/* Idle time */}
                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <Label className="text-xs font-medium text-gray-700">
                                Idle Time
                              </Label>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Show popup when the visitor stops interacting with the page
                            </p>
                          </div>
                          <Switch
                            checked={selectedCampaign.triggers.idleTime !== null}
                            onCheckedChange={(checked) =>
                              updateCampaign(selectedCampaign.id, {
                                triggers: {
                                  ...selectedCampaign.triggers,
                                  idleTime: checked ? 30 : null,
                                },
                              })
                            }
                            size="sm"
                          />
                        </div>
                        {selectedCampaign.triggers.idleTime !== null && (
                          <div className="flex items-center gap-2 mt-2 ml-5">
                            <Input
                              type="number"
                              value={selectedCampaign.triggers.idleTime}
                              onChange={(e) =>
                                updateCampaign(selectedCampaign.id, {
                                  triggers: {
                                    ...selectedCampaign.triggers,
                                    idleTime: Math.max(5, parseInt(e.target.value) || 5),
                                  },
                                })
                              }
                              className="w-20 text-xs h-7"
                              min={5}
                              max={600}
                            />
                            <span className="text-[11px] text-gray-400">seconds</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Section C: Suppression */}
                  <CollapsibleSection
                    title="Suppression"
                    expanded={expandedSections.suppression}
                    onToggle={() => toggleSection("suppression")}
                  >
                    <div className="space-y-3">
                      <p className="text-[11px] text-gray-400">
                        How long to suppress the popup after a visitor dismisses or converts.
                      </p>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">
                          Dismiss cookie duration
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={selectedCampaign.suppression.dismissCookieDays}
                            onChange={(e) =>
                              updateCampaign(selectedCampaign.id, {
                                suppression: {
                                  ...selectedCampaign.suppression,
                                  dismissCookieDays: Math.max(
                                    1,
                                    parseInt(e.target.value) || 1,
                                  ),
                                },
                              })
                            }
                            className="w-20 text-xs h-7"
                            min={1}
                            max={3650}
                          />
                          <span className="text-[11px] text-gray-400">days</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          After dismissing, the popup will not appear again for this many days.
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">
                          Converted cookie duration
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={selectedCampaign.suppression.convertedCookieDays}
                            onChange={(e) =>
                              updateCampaign(selectedCampaign.id, {
                                suppression: {
                                  ...selectedCampaign.suppression,
                                  convertedCookieDays: Math.max(
                                    1,
                                    parseInt(e.target.value) || 1,
                                  ),
                                },
                              })
                            }
                            className="w-20 text-xs h-7"
                            min={1}
                            max={3650}
                          />
                          <span className="text-[11px] text-gray-400">days</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          After converting, the popup will not appear again for this many days.
                        </p>
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Section D: Style */}
                  <CollapsibleSection
                    title="Style"
                    expanded={expandedSections.style}
                    onToggle={() => toggleSection("style")}
                  >
                    <div className="space-y-3">
                      {/* Overlay opacity */}
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-gray-700">
                            Overlay Opacity
                          </Label>
                          <span className="text-[11px] text-gray-400">
                            {Math.round(selectedCampaign.styleOverrides.overlayOpacity * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(
                            selectedCampaign.styleOverrides.overlayOpacity * 100,
                          )}
                          onChange={(e) =>
                            updateCampaign(selectedCampaign.id, {
                              styleOverrides: {
                                ...selectedCampaign.styleOverrides,
                                overlayOpacity: parseInt(e.target.value) / 100,
                              },
                            })
                          }
                          className="w-full mt-1 accent-[#2D6A4F]"
                        />
                      </div>

                      {/* Border radius */}
                      <div>
                        <Label className="text-xs font-medium text-gray-700">
                          Border Radius
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={selectedCampaign.styleOverrides.borderRadius}
                            onChange={(e) =>
                              updateCampaign(selectedCampaign.id, {
                                styleOverrides: {
                                  ...selectedCampaign.styleOverrides,
                                  borderRadius: Math.max(
                                    0,
                                    parseInt(e.target.value) || 0,
                                  ),
                                },
                              })
                            }
                            className="w-20 text-xs h-7"
                            min={0}
                            max={48}
                          />
                          <span className="text-[11px] text-gray-400">px</span>
                        </div>
                      </div>

                      {/* Animation */}
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Animation</Label>
                        <select
                          value={selectedCampaign.styleOverrides.animation}
                          onChange={(e) =>
                            updateCampaign(selectedCampaign.id, {
                              styleOverrides: {
                                ...selectedCampaign.styleOverrides,
                                animation: e.target.value as PopupStyleConfig["animation"],
                              },
                            })
                          }
                          className="w-full mt-1 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:ring-offset-1"
                        >
                          {ANIMATIONS.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Max width */}
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Max Width</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={selectedCampaign.styleOverrides.maxWidth}
                            onChange={(e) =>
                              updateCampaign(selectedCampaign.id, {
                                styleOverrides: {
                                  ...selectedCampaign.styleOverrides,
                                  maxWidth: Math.max(
                                    200,
                                    parseInt(e.target.value) || 200,
                                  ),
                                },
                              })
                            }
                            className="w-24 text-xs h-7"
                            min={200}
                            max={1200}
                          />
                          <span className="text-[11px] text-gray-400">px</span>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Section E: Install Code */}
                  <CollapsibleSection
                    title="Install Code"
                    expanded={expandedSections.install}
                    onToggle={() => toggleSection("install")}
                  >
                    <div className="space-y-3">
                      <p className="text-[11px] text-gray-400">
                        Add this script to every page where you want popups to appear.
                        One script tag handles all your active campaigns.
                      </p>
                      <div className="relative">
                        <pre className="text-[11px] font-mono bg-gray-50 border border-[#E5E7EB] rounded-lg px-3 py-3 overflow-x-auto text-gray-700 whitespace-pre-wrap break-all">
{`<script src="${process.env.NEXT_PUBLIC_APP_URL || "https://getmyvsl.com"}/api/popup/widget/${funnel.userId}" defer></script>`}
                        </pre>
                        <button
                          type="button"
                          onClick={() => {
                            const code = `<script src="${process.env.NEXT_PUBLIC_APP_URL || "https://getmyvsl.com"}/api/popup/widget/${funnel.userId}" defer></script>`;
                            navigator.clipboard.writeText(code).then(() => {
                              setScriptCopied(true);
                              toast.success("Script tag copied");
                              setTimeout(() => setScriptCopied(false), 2000);
                            });
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-white border border-[#E5E7EB] text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
                          aria-label="Copy script tag"
                        >
                          {scriptCopied ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          The widget script automatically loads your active popup campaigns
                          and handles all trigger logic, impression tracking, and cookie suppression.
                          No additional configuration is needed on your website.
                        </p>
                      </div>
                    </div>
                  </CollapsibleSection>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Collapsible Section ──

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expanded && <div className="px-3 pb-3 border-t border-[#E5E7EB]">{children}</div>}
    </div>
  );
}
