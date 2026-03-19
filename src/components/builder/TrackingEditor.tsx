"use client";

import { useState, useEffect } from "react";
import { FunnelConfig } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react";
import Image from "next/image";

interface WebhookDeliveryRow {
  id: string;
  statusCode: number | null;
  success: boolean;
  attempts: number;
  errorMessage: string | null;
  createdAt: string;
}

interface TrackingEditorProps {
  config: FunnelConfig;
  onSave: (config: FunnelConfig) => void;
  funnelId?: string;
}

export function TrackingEditor({ config, onSave, funnelId }: TrackingEditorProps) {
  const [deliveries, setDeliveries] = useState<WebhookDeliveryRow[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  useEffect(() => {
    if (!funnelId || !config.webhook?.url) return;
    setLoadingDeliveries(true);
    fetch(`/api/funnels/${funnelId}/webhooks`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setDeliveries(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadingDeliveries(false));
  }, [funnelId, config.webhook?.url]);
  function updateTracking(field: string, value: string) {
    const newConfig = JSON.parse(JSON.stringify(config));
    if (!newConfig.tracking) newConfig.tracking = {};
    newConfig.tracking[field] = value;
    onSave(newConfig);
  }

  return (
    <div className="space-y-5">
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700 font-medium mb-1">Ad Tracking Pixels</p>
        <p className="text-[11px] text-blue-600 leading-relaxed">
          Add your pixel IDs to track conversions from paid ads. Conversion events fire
          automatically when a lead submits their email.
        </p>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-1.5">Facebook Pixel ID</Label>
        <Input
          value={config.tracking?.fbPixelId ?? ""}
          onChange={e => updateTracking("fbPixelId", e.target.value)}
          placeholder="123456789012345"
          className="text-sm font-mono"
          maxLength={20}
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Find this in Meta Events Manager under your pixel settings.
        </p>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-1.5">TikTok Pixel ID</Label>
        <Input
          value={config.tracking?.tiktokPixelId ?? ""}
          onChange={e => updateTracking("tiktokPixelId", e.target.value)}
          placeholder="ABCDEF123456"
          className="text-sm font-mono"
          maxLength={30}
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Find this in TikTok Ads Manager under Events.
        </p>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-1.5">Google Analytics 4 Measurement ID</Label>
        <Input
          value={config.tracking?.ga4MeasurementId ?? ""}
          onChange={e => updateTracking("ga4MeasurementId", e.target.value)}
          placeholder="G-XXXXXXXXXX"
          className="text-sm font-mono"
          maxLength={20}
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Find this in GA4 under Admin &gt; Data Streams.
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-[11px] text-gray-500 font-medium mb-1">Events fired automatically</p>
        <ul className="text-[10px] text-gray-400 space-y-1">
          <li>PageView: when funnel loads</li>
          <li>ViewContent / quiz_start: when quiz begins</li>
          <li>Lead / SubmitForm / generate_lead: when email is submitted</li>
        </ul>
      </div>

      <Separator />

      {/* Webhook */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Label className="text-xs text-gray-500">Webhook URL</Label>
          <span className="text-[9px] text-[#9CA3AF] bg-[#F3F4F6] px-1.5 py-0.5 rounded">Optional</span>
        </div>
        <Input
          value={config.webhook?.url ?? ""}
          onChange={e => {
            const newConfig = JSON.parse(JSON.stringify(config));
            if (!newConfig.webhook) newConfig.webhook = {};
            newConfig.webhook.url = e.target.value;
            onSave(newConfig);
          }}
          placeholder="https://hooks.zapier.com/..."
          className="text-sm font-mono"
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Receives a POST with lead data (email, score, tier, answers) on every submission.
        </p>
      </div>

      {/* Webhook Delivery Log */}
      {config.webhook?.url && funnelId && (
        <>
          <div>
            <p className="text-[11px] text-gray-500 font-medium mb-2">Recent Deliveries</p>
            {loadingDeliveries ? (
              <div className="text-xs text-[#9CA3AF] py-3">Loading...</div>
            ) : deliveries.length === 0 ? (
              <div className="bg-[#F9FAFB] rounded-lg p-3">
                <p className="text-xs text-[#9CA3AF]">
                  No webhook deliveries yet. Deliveries will appear here after your first lead submission.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {deliveries.map((d) => (
                  <div key={d.id} className="flex items-center gap-2 text-xs bg-[#F9FAFB] rounded-lg px-3 py-2">
                    {d.success ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    )}
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      d.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                    }`}>
                      {d.statusCode || "ERR"}
                    </span>
                    <span className="text-[#9CA3AF] flex-1 truncate">
                      {d.errorMessage || (d.success ? "OK" : "Failed")}
                    </span>
                    <span className="text-[10px] text-[#D1D5DB] flex-shrink-0 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Cursive SuperPixel Upsell */}
      <div className="border border-blue-200 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Image src="/cursive-logo.png" alt="Cursive" width={32} height={32} className="rounded-lg" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Cursive SuperPixel</p>
              <p className="text-[10px] text-blue-600">Identity Resolution Technology</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Unmask up to <span className="font-semibold text-blue-700">60% of anonymous visitors</span> on
            your funnel pages, even if they never submit the quiz. Get full contact info (name, email, phone)
            for every visitor that lands on your funnel.
          </p>
          <ul className="text-[11px] text-gray-500 space-y-1.5 mb-4">
            <li className="flex items-start gap-1.5">
              <span className="text-blue-500 mt-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </span>
              Resolve anonymous visitors into real leads with name, email, phone
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-500 mt-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </span>
              Works on all funnel page visitors, no form fill required
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-500 mt-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </span>
              Sync leads to your CRM, email platform, or ad audiences automatically
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-500 mt-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </span>
              Capture 3-5x more leads from the same funnel traffic
            </li>
          </ul>
          <a
            href={`mailto:adam@meetcursive.com?subject=SuperPixel%20Request%20for%20MyVSL&body=Hi%20Cursive%20team%2C%0A%0AI%27d%20like%20to%20add%20the%20SuperPixel%20to%20my%20MyVSL%20funnel.%0A%0AFunnel%20URL%3A%20%0AMy%20email%3A%20%0A%0AThanks!`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Apply for SuperPixel
            <ExternalLink className="w-3 h-3" />
          </a>
          <p className="text-center text-[9px] text-gray-400 mt-2">
            Powered by <a href="https://meetcursive.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Cursive</a>. Identity Resolution for Performance Marketers
          </p>
        </div>
      </div>
    </div>
  );
}
