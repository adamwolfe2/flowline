"use client";

import { useEffect, useState, useCallback } from "react";
import { Funnel, FunnelConfig } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentEditor } from "@/components/builder/ContentEditor";
import { BrandEditor } from "@/components/builder/BrandEditor";
import { CalendarEditor } from "@/components/builder/CalendarEditor";
import { PublishPanel } from "@/components/builder/PublishPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Monitor, Smartphone, Eye } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function BuilderPage() {
  const params = useParams();
  const funnelId = params.funnelId as string;
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [config, setConfig] = useState<FunnelConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    fetch(`/api/funnels/${funnelId}`)
      .then(r => r.json())
      .then(data => {
        setFunnel(data);
        setConfig(data.config);
      });
  }, [funnelId]);

  const saveConfig = useCallback(async (newConfig: FunnelConfig) => {
    setConfig(newConfig);
    setSaving(true);
    await fetch(`/api/funnels/${funnelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: newConfig }),
    });
    setSaving(false);
    setPreviewKey(k => k + 1);
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
          {saving && <span className="text-xs text-gray-400">Saving...</span>}
        </div>
        <div className="flex items-center gap-2">
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
        <div className="w-[380px] border-r border-gray-100 flex flex-col overflow-hidden flex-shrink-0">
          <Tabs defaultValue="content" className="flex flex-col h-full">
            <TabsList className="mx-3 mt-3 mb-0 grid grid-cols-4 h-9">
              <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
              <TabsTrigger value="brand" className="text-xs">Brand</TabsTrigger>
              <TabsTrigger value="calendars" className="text-xs">Calendars</TabsTrigger>
              <TabsTrigger value="publish" className="text-xs">Publish</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto p-4">
              <TabsContent value="content" className="mt-0">
                <ContentEditor config={config} onSave={saveConfig} />
              </TabsContent>
              <TabsContent value="brand" className="mt-0">
                <BrandEditor config={config} onSave={saveConfig} />
              </TabsContent>
              <TabsContent value="calendars" className="mt-0">
                <CalendarEditor config={config} onSave={saveConfig} />
              </TabsContent>
              <TabsContent value="publish" className="mt-0">
                <PublishPanel funnel={funnel} config={config} onUpdate={setFunnel} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Preview pane */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-8 overflow-hidden">
          <div
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300"
            style={{
              width: previewMode === "mobile" ? "390px" : "100%",
              maxWidth: previewMode === "desktop" ? "800px" : "390px",
              height: "100%",
            }}
          >
            <iframe
              key={previewKey}
              src={`/f/preview/${funnelId}`}
              className="w-full h-full border-0"
              title="Funnel preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
