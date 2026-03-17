"use client";

import Link from "next/link";
import { Funnel, FunnelStats } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink, Pencil, Users, Eye, Target } from "lucide-react";

interface FunnelCardProps {
  funnel: Funnel;
  stats: FunnelStats;
}

export function FunnelCard({ funnel, stats }: FunnelCardProps) {
  const funnelUrl = funnel.slug ? `${funnel.slug}.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'flowline.app'}` : '';

  return (
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
        <Badge variant={funnel.published ? "default" : "secondary"} className="text-[10px]">
          {funnel.published ? "Live" : "Draft"}
        </Badge>
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
          <p className="text-lg font-bold text-gray-900">{stats.conversionRate}%</p>
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
            <Button variant="ghost" size="sm" className="px-2">
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        )}
      </div>
    </Card>
  );
}
