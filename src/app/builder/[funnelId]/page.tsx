"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Funnel, FunnelConfig } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentEditor } from "@/components/builder/ContentEditor";
import { BrandEditor } from "@/components/builder/BrandEditor";
import { CalendarEditor } from "@/components/builder/CalendarEditor";
import { PublishPanel } from "@/components/builder/PublishPanel";
import { ABTestEditor, Variant } from "@/components/builder/ABTestEditor";
import { SequenceEditor } from "@/components/builder/SequenceEditor";
import { TrackingEditor } from "@/components/builder/TrackingEditor";
import { ContentBlocksEditor } from "@/components/builder/ContentBlocksEditor";
import { UpgradeGate } from "@/components/builder/UpgradeGate";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Monitor, Smartphone, Eye, Pencil, FlaskConical, Mail, BarChart3, LayoutGrid, ChevronDown, FileText, Palette, Calendar, Send, Copy, RotateCcw, Check, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const funnelId = params.funnelId as string;
  const [duplicating, setDuplicating] = useState(false);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [config, setConfig] = useState<FunnelConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "failed">("idle");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingConfigRef = useRef<FunnelConfig | null>(null);

  const [userPlan, setUserPlan] = useState<string>("free");

  // A/B test variant editing state
  const [variants, setVariants] = useState<Variant[]>([]);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null); // null = control
  const [variantDropdownOpen, setVariantDropdownOpen] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Listen for click-to-edit messages from the preview iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== "myvsl:edit") return;
      const { section, field } = event.data;
      setActiveTab(section);
      setTimeout(() => {
        const el = document.getElementById(`editor-${field}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-2", "ring-[#2D6A4F]", "ring-offset-2");
          setTimeout(() => el.classList.remove("ring-2", "ring-[#2D6A4F]", "ring-offset-2"), 2000);
        }
      }, 100);
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    fetch(`/api/funnels/${funnelId}`)
      .then(r => r.json())
      .then(data => {
        setFunnel(data);
        setConfig(data.config);
      });
    // Also fetch variants
    fetch(`/api/funnels/${funnelId}/variants`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setVariants(data); })
      .catch(() => {});
  }, [funnelId]);

  // Fetch user plan for feature gating
  useEffect(() => {
    fetch("/api/user")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.plan) setUserPlan(data.plan);
      })
      .catch(() => {});
  }, []);

  // Switch editing context between control and variant
  function switchToVariant(variantId: string | null) {
    // Flush pending save before switching
    if (pendingConfigRef.current && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      flushSave(pendingConfigRef.current);
      pendingConfigRef.current = null;
    }
    setEditingVariantId(variantId);
    if (variantId === null) {
      // Switch back to control
      setConfig(funnel?.config as FunnelConfig);
    } else {
      const variant = variants.find(v => v.id === variantId);
      if (variant) setConfig(variant.config);
    }
    setHasUnsavedChanges(false);
    setSaveStatus("idle");
    setVariantDropdownOpen(false);
    setPreviewKey(k => k + 1);
  }

  // Flush any pending save (used on unmount or immediate-save scenarios)
  const flushSave = useCallback(async (configToSave: FunnelConfig) => {
    setSaving(true);
    let res;
    if (editingVariantId) {
      // Save variant config
      res = await fetch(`/api/funnels/${funnelId}/variants/${editingVariantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: configToSave }),
      });
      if (res.ok) {
        const updated = await res.json();
        setVariants(prev => prev.map(v => v.id === editingVariantId ? updated : v));
      }
    } else {
      // Save control config
      res = await fetch(`/api/funnels/${funnelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: configToSave }),
      });
    }
    setSaving(false);
    if (res.ok) {
      setHasUnsavedChanges(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("failed");
      toast.error("Failed to save changes");
    }
  }, [funnelId, editingVariantId]);

  async function handleDuplicate() {
    setDuplicating(true);
    try {
      const res = await fetch(`/api/funnels/${funnelId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success("Funnel duplicated");
        router.push(`/builder/${data.id}`);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to duplicate funnel");
      }
    } catch {
      toast.error("Failed to duplicate funnel");
    } finally {
      setDuplicating(false);
    }
  }

  // Send config to the preview iframe via postMessage (no reload needed)
  const postConfigToPreview = useCallback((configToPost: FunnelConfig) => {
    const iframe = document.querySelector('iframe[title="Funnel preview"]') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'myvsl:config-update', config: configToPost }, '*');
    }
  }, []);

  // Debounced save: updates config immediately (for responsive UI), saves after 800ms of inactivity
  const saveConfig = useCallback((newConfig: FunnelConfig) => {
    setConfig(newConfig);
    setHasUnsavedChanges(true);
    setSaveStatus("idle");
    pendingConfigRef.current = newConfig;

    // Immediately push to preview iframe for instant feedback
    postConfigToPreview(newConfig);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (pendingConfigRef.current) {
        flushSave(pendingConfigRef.current);
        pendingConfigRef.current = null;
      }
    }, 800);
  }, [flushSave, postConfigToPreview]);

  // Flush pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (pendingConfigRef.current) {
        // Fire-and-forget save on unmount
        fetch(`/api/funnels/${funnelId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config: pendingConfigRef.current }),
          keepalive: true,
        });
      }
    };
  }, [funnelId]);

  if (!funnel || !config) {
    return (
      <div className="h-screen flex items-center justify-center" role="status" aria-busy="true">
        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full" />
        <span className="sr-only">Loading builder...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="h-12 border-b border-gray-100 flex items-center justify-between px-2 sm:px-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1 sm:gap-1.5 text-xs px-2 sm:px-3">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </Link>
          <div className="h-5 w-px bg-gray-200 hidden sm:block" />
          <span className="text-sm font-medium text-gray-700 truncate max-w-[120px] sm:max-w-[200px] hidden sm:block">
            {config.brand.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs px-2 text-gray-500 hover:text-gray-700"
            onClick={handleDuplicate}
            disabled={duplicating}
            title="Duplicate funnel"
          >
            {duplicating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{duplicating ? "Duplicating..." : "Duplicate"}</span>
          </Button>
          <div className="h-5 w-px bg-gray-200 hidden sm:block" />
          {saving && (
            <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving
            </span>
          )}
          {!saving && saveStatus === "saved" && (
            <span className="text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-[scale-pop_0.3s_ease-out]">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
          {!saving && saveStatus === "failed" && (
            <span className="text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" />
              Failed
              <button
                onClick={() => {
                  if (pendingConfigRef.current) {
                    flushSave(pendingConfigRef.current);
                  } else if (config) {
                    flushSave(config);
                  }
                }}
                className="ml-0.5 underline hover:no-underline flex items-center gap-0.5"
              >
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
            </span>
          )}
          {!saving && saveStatus === "idle" && hasUnsavedChanges && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4"/></svg>
              Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="md:hidden flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <><Eye className="w-3.5 h-3.5" /> Preview</>
            ) : (
              <><Pencil className="w-3.5 h-3.5" /> Edit</>
            )}
          </button>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`p-1.5 rounded-md transition-colors ${previewMode === "desktop" ? "bg-white shadow-sm" : "text-gray-400"}`}
              aria-label="Desktop preview"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`p-1.5 rounded-md transition-colors ${previewMode === "mobile" ? "bg-white shadow-sm" : "text-gray-400"}`}
              aria-label="Mobile preview"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
          <a href={`/f/preview/${funnelId}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5" />
              Preview
            </Button>
          </a>
        </div>
      </div>

      {/* Main area — tabs on top, content + preview below */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-gray-100 flex items-center gap-2 px-2 sm:px-4 flex-shrink-0 overflow-x-auto scrollbar-hide">
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex w-max gap-0.5 bg-transparent p-0 h-10">
              <TabsTrigger value="content" className="text-xs px-2 sm:px-3 py-2 gap-1 rounded-md data-[state=active]:bg-gray-100">
                <FileText className="w-3 h-3" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger value="blocks" className="text-xs px-2 sm:px-3 py-2 gap-1 rounded-md data-[state=active]:bg-gray-100">
                <LayoutGrid className="w-3 h-3" />
                <span className="hidden sm:inline">Blocks</span>
              </TabsTrigger>
              <TabsTrigger value="brand" className="text-xs px-2 sm:px-3 py-2 gap-1 rounded-md data-[state=active]:bg-gray-100">
                <Palette className="w-3 h-3" />
                <span className="hidden sm:inline">Brand</span>
              </TabsTrigger>
              <TabsTrigger value="calendars" className="text-xs px-2 sm:px-3 py-2 gap-1 rounded-md data-[state=active]:bg-gray-100">
                <Calendar className="w-3 h-3" />
                <span className="hidden sm:inline">Calendars</span>
              </TabsTrigger>
              <TabsTrigger value="emails" className="text-xs px-2 sm:px-3 py-2 gap-1 rounded-md data-[state=active]:bg-gray-100">
                <Mail className="w-3 h-3" />
                <span className="hidden sm:inline">Emails</span>
              </TabsTrigger>
              <TabsTrigger value="ab-test" className="text-xs px-2 sm:px-3 py-2 gap-1 rounded-md data-[state=active]:bg-gray-100">
                <FlaskConical className="w-3 h-3" />
                <span className="hidden sm:inline">A/B</span>
              </TabsTrigger>
              <TabsTrigger value="tracking" className="text-xs px-2 sm:px-3 py-2 gap-1 rounded-md data-[state=active]:bg-gray-100">
                <BarChart3 className="w-3 h-3" />
                <span className="hidden sm:inline">Tracking</span>
              </TabsTrigger>
              <TabsTrigger value="publish" className="text-xs px-2 sm:px-3 py-2 gap-1 rounded-md data-[state=active]:bg-gray-100">
                <Send className="w-3 h-3" />
                <span className="hidden sm:inline">Publish</span>
              </TabsTrigger>
            </TabsList>
          </div>
          {/* Variant selector */}
          {variants.length > 0 && (
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setVariantDropdownOpen(!variantDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors border ${
                  editingVariantId
                    ? "bg-purple-50 border-purple-200 text-purple-700"
                    : "bg-green-50 border-green-200 text-green-700"
                }`}
              >
                <FlaskConical className="w-3 h-3" />
                {editingVariantId ? variants.find(v => v.id === editingVariantId)?.name || "Variant" : "Control"}
                <ChevronDown className={`w-3 h-3 transition-transform ${variantDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {variantDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={() => switchToVariant(null)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${
                      !editingVariantId ? "bg-green-50 font-medium text-green-700" : "text-gray-700"
                    }`}
                  >
                    Control (Original)
                    {!editingVariantId && <span className="text-[9px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">Editing</span>}
                  </button>
                  {variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => switchToVariant(v.id)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors flex items-center justify-between border-t border-gray-50 ${
                        editingVariantId === v.id ? "bg-purple-50 font-medium text-purple-700" : "text-gray-700"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {v.name}
                        {!v.active && <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">Paused</span>}
                      </span>
                      {editingVariantId === v.id && <span className="text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">Editing</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content + Preview side by side */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor panel */}
          <div className={`${sidebarOpen ? 'w-full md:w-[420px]' : 'hidden md:block md:w-[420px]'} border-r border-gray-100 overflow-y-auto p-3 sm:p-4 flex-shrink-0`}>
            <TabsContent value="content" className="mt-0">
              <ContentEditor config={config} onSave={saveConfig} />
            </TabsContent>
            <TabsContent value="blocks" className="mt-0">
              <ContentBlocksEditor config={config} onSave={saveConfig} />
            </TabsContent>
            <TabsContent value="brand" className="mt-0">
              <BrandEditor config={config} onSave={saveConfig} />
            </TabsContent>
            <TabsContent value="calendars" className="mt-0">
              <CalendarEditor config={config} onSave={saveConfig} />
            </TabsContent>
            <TabsContent value="emails" className="mt-0">
              <UpgradeGate feature="Email Sequences" plan={userPlan}>
                <SequenceEditor funnel={funnel} />
              </UpgradeGate>
            </TabsContent>
            <TabsContent value="ab-test" className="mt-0">
              <UpgradeGate feature="A/B Testing" plan={userPlan}>
                <ABTestEditor funnel={funnel} onVariantsChange={(v) => {
                  setVariants(v);
                  if (editingVariantId && !v.find(variant => variant.id === editingVariantId)) {
                    switchToVariant(null);
                  }
                }} />
              </UpgradeGate>
            </TabsContent>
            <TabsContent value="tracking" className="mt-0">
              <UpgradeGate feature="Tracking & Webhooks" plan={userPlan}>
                <TrackingEditor config={config} onSave={saveConfig} funnelId={funnel.id} />
              </UpgradeGate>
            </TabsContent>
            <TabsContent value="publish" className="mt-0">
              <PublishPanel funnel={funnel} config={config} onUpdate={setFunnel} />
            </TabsContent>
          </div>

          {/* Preview pane */}
          <div className={`flex-1 bg-gray-50 flex items-start justify-center overflow-hidden ${previewMode === "mobile" ? "p-3 sm:p-6" : "p-2 sm:p-3"}`}>
            <ErrorBoundary>
              <div
                className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300"
                style={{
                  width: previewMode === "mobile" ? "min(375px, 100%)" : "100%",
                  maxWidth: previewMode === "desktop" ? "100%" : "375px",
                  height: "100%",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-[#F9FAFB]">
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-[#E5E7EB] border-t-[#2D6A4F] rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-[#9CA3AF]">Loading preview</p>
                  </div>
                </div>
                <iframe
                  key={previewKey}
                  src={`/f/preview/${funnelId}`}
                  className="w-full h-full border-0 relative z-10"
                  title="Funnel preview"
                />
              </div>
            </ErrorBoundary>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
