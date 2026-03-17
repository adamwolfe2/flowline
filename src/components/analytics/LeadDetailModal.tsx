"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Clock, Smartphone, Monitor, Tablet, Globe, Target, ArrowRight } from "lucide-react";

interface LeadDetailModalProps {
  leadId: string | null;
  onClose: () => void;
}

export function LeadDetailModal({ leadId, onClose }: LeadDetailModalProps) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!leadId) { setData(null); return; }
    setLoading(true);
    fetch(`/api/leads/${leadId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [leadId]);

  const lead = data?.lead as Record<string, unknown> | undefined;
  const session = data?.session as Record<string, unknown> | undefined;
  const events = (data?.events as Array<Record<string, unknown>>) || [];

  const tierColor = {
    high: "bg-emerald-100 text-emerald-700",
    mid: "bg-amber-100 text-amber-700",
    low: "bg-gray-100 text-gray-600",
  };

  const deviceIconMap = {
    mobile: Smartphone,
    desktop: Monitor,
    tablet: Tablet,
  };

  return (
    <Sheet open={!!leadId} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold text-[#333333]">Lead Details</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : lead ? (
          <div className="mt-6 space-y-6">
            {/* Lead info card */}
            <div className="bg-[#FBFBFB] border border-[#EBEBEB] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#2D6A4F]/10 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#2D6A4F]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#333333]">{lead.email as string}</p>
                  <p className="text-[11px] text-[#A3A3A3]">
                    {new Date(lead.createdAt as string).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={tierColor[(lead.calendarTier as string) as keyof typeof tierColor] || tierColor.low}>
                  {(lead.calendarTier as string || 'low').toUpperCase()} TIER
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  <Target className="w-3 h-3 mr-1" /> Score: {lead.score as number}
                </Badge>
                {lead.deviceType ? (() => {
                  const DeviceIcon = deviceIconMap[(lead.deviceType as string) as keyof typeof deviceIconMap] || Monitor;
                  return (
                    <Badge variant="secondary" className="text-[10px]">
                      <DeviceIcon className="w-3 h-3 mr-1" /> {lead.deviceType as string}
                    </Badge>
                  );
                })() : null}
                {lead.utmSource ? (
                  <Badge variant="secondary" className="text-[10px]">
                    <Globe className="w-3 h-3 mr-1" /> {lead.utmSource as string}
                  </Badge>
                ) : null}
              </div>
            </div>

            {/* Answers */}
            <div>
              <h3 className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-3">Answers</h3>
              <div className="space-y-2">
                {Object.entries((lead.answers as Record<string, string>) || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-white border border-[#EBEBEB] rounded-lg px-3 py-2">
                    <span className="text-xs text-[#737373]">{key}</span>
                    <span className="text-xs font-medium text-[#333333]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Session timeline */}
            {events.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-3">Session Timeline</h3>
                <div className="space-y-0">
                  {events.map((event, i) => (
                    <div key={i} className="flex items-start gap-3 relative">
                      {i < events.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-px bg-[#EBEBEB]" />
                      )}
                      <div className="w-6 h-6 rounded-full bg-[#FBFBFB] border border-[#EBEBEB] flex items-center justify-center flex-shrink-0 z-10">
                        <div className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                      </div>
                      <div className="pb-4 flex-1">
                        <p className="text-xs font-medium text-[#333333]">
                          {(event.eventType as string || '').replace(/_/g, ' ')}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#A3A3A3]">{event.stepKey as string}</span>
                          {event.timeOnStepMs ? (
                            <span className="text-[10px] text-[#A3A3A3]">
                              <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                              {Math.round((event.timeOnStepMs as number) / 1000)}s
                            </span>
                          ) : null}
                          {event.answerLabel ? (
                            <span className="text-[10px] text-[#2D6A4F] font-medium">
                              <ArrowRight className="w-2.5 h-2.5 inline mr-0.5" />
                              {event.answerLabel as string}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session summary */}
            {session && (
              <div className="bg-[#FBFBFB] border border-[#EBEBEB] rounded-xl p-4">
                <h3 className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-2">Session</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#A3A3A3]">Duration</span>
                    <p className="font-medium text-[#333333]">
                      {session.totalDurationMs ? `${Math.round((session.totalDurationMs as number) / 1000)}s` : '--'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#A3A3A3]">Furthest Step</span>
                    <p className="font-medium text-[#333333]">Step {session.furthestStepReached as number}</p>
                  </div>
                  <div>
                    <span className="text-[#A3A3A3]">Completed</span>
                    <p className="font-medium text-[#333333]">{session.completed ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-[#A3A3A3]">Converted</span>
                    <p className="font-medium text-[#333333]">{session.converted ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
