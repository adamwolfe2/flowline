"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Funnel, FunnelConfig } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentEditor } from "@/components/builder/ContentEditor";
import { BrandEditor } from "@/components/builder/BrandEditor";
import { CalendarEditor } from "@/components/builder/CalendarEditor";
import { PublishPanel } from "@/components/builder/PublishPanel";
import { ABTestEditor } from "@/components/builder/ABTestEditor";
import { SequenceEditor } from "@/components/builder/SequenceEditor";
import { TrackingEditor } from "@/components/builder/TrackingEditor";
import { ContentBlocksEditor } from "@/components/builder/ContentBlocksEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Monitor, Smartphone, Eye, Pencil, FlaskConical, Mail, BarChart3, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function BuilderPage() {
  const params = useParams();
  const funnelId = params.funnelId as string;
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [config, setConfig] = useState<FunnelConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "failed">("idle");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingConfigRef = useRef<FunnelConfig | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    fetch(`/api/funnels/${funnelId}`)
      .then(r => r.json())
      .then(data => {
        setFunnel(data);
        setConfig(data.config);
      });
  }, [funnelId]);

  // Flush any pending save (used on unmount or immediate-save scenarios)
  const flushSave = useCallback(async (configToSave: FunnelConfig) => {
    setSaving(true);
    const res = await fetch(`/api/funnels/${funnelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: configToSave }),
    });
    setSaving(false);
    if (res.ok) {
      setHasUnsavedChanges(false);
      setSaveStatus("saved");
      setPreviewKey(k => k + 1);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("failed");
      toast.error("Failed to save changes");
    }
  }, [funnelId]);

  // Debounced save: updates config immediately (for responsive UI), saves after 800ms of inactivity
  const saveConfig = useCallback((newConfig: FunnelConfig) => {
    setConfig(newConfig);
    setHasUnsavedChanges(true);
    setSaveStatus("idle");
    pendingConfigRef.current = newConfig;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (pendingConfigRef.current) {
        flushSave(pendingConfigRef.current);
        pendingConfigRef.current = null;
      }
    }, 800);
  }, [flushSave]);

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
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Button>
          </Link>
          <div className="h-5 w-px bg-gray-200" />
          <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
            {config.brand.name}
          </span>
          {saving && (
            <span className="text-xs text-gray-400 animate-pulse flex items-center gap-1">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Saving
            </span>
          )}
          {!saving && saveStatus === "saved" && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              Saved
            </span>
          )}
          {!saving && saveStatus === "failed" && (
            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              Save failed
            </span>
          )}
          {!saving && saveStatus === "idle" && hasUnsavedChanges && (
            <span className="text-xs text-amber-500 flex items-center gap-1">
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
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`p-1.5 rounded-md transition-colors ${previewMode === "mobile" ? "bg-white shadow-sm" : "text-gray-400"}`}
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

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Side panel */}
        <div className={`${sidebarOpen ? 'w-full md:w-[380px]' : 'hidden md:block md:w-[380px]'} border-r border-gray-100 flex flex-col overflow-hidden flex-shrink-0`}>
          <Tabs defaultValue="content" className="flex flex-col h-full">
            <div className="relative mx-3 mt-3 mb-0">
              <TabsList className="w-full flex overflow-x-auto gap-1 bg-gray-50 p-1 rounded-lg scrollbar-hide">
                <TabsTrigger value="content" className="text-xs shrink-0 whitespace-nowrap">Content</TabsTrigger>
                <TabsTrigger value="blocks" className="text-xs gap-1 shrink-0 whitespace-nowrap">
                  <LayoutGrid className="w-3 h-3" />
                  Blocks
                </TabsTrigger>
                <TabsTrigger value="brand" className="text-xs shrink-0 whitespace-nowrap">Brand</TabsTrigger>
                <TabsTrigger value="calendars" className="text-xs shrink-0 whitespace-nowrap">Calendars</TabsTrigger>
                <TabsTrigger value="emails" className="text-xs gap-1 shrink-0 whitespace-nowrap">
                  <Mail className="w-3 h-3" />
                  Emails
                </TabsTrigger>
                <TabsTrigger value="ab-test" className="text-xs gap-1 shrink-0 whitespace-nowrap">
                  <FlaskConical className="w-3 h-3" />
                  A/B
                </TabsTrigger>
                <TabsTrigger value="tracking" className="text-xs gap-1 shrink-0 whitespace-nowrap">
                  <BarChart3 className="w-3 h-3" />
                  Tracking
                </TabsTrigger>
                <TabsTrigger value="publish" className="text-xs shrink-0 whitespace-nowrap">Publish</TabsTrigger>
              </TabsList>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none rounded-r-lg md:hidden" />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
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
                <SequenceEditor funnel={funnel} />
              </TabsContent>
              <TabsContent value="ab-test" className="mt-0">
                <ABTestEditor funnel={funnel} />
              </TabsContent>
              <TabsContent value="tracking" className="mt-0">
                <TrackingEditor config={config} onSave={saveConfig} />
              </TabsContent>
              <TabsContent value="publish" className="mt-0">
                <PublishPanel funnel={funnel} config={config} onUpdate={setFunnel} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Preview pane */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-8 overflow-hidden">
          <ErrorBoundary>
            <div
              className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300"
              style={{
                width: previewMode === "mobile" ? "min(375px, 100%)" : "100%",
                maxWidth: previewMode === "desktop" ? "800px" : "375px",
                height: "100%",
              }}
            >
              {/* Loading skeleton behind iframe */}
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
    </div>
  );
}
