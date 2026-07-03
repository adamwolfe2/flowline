"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface LeadsChartProps {
  data: Array<{ date: string; count: number }>;
  timeRange: string;
}

export function LeadsChart({ data, timeRange }: LeadsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
        <LineChartIcon className="w-8 h-8 text-gray-200" />
        <p className="text-sm text-gray-400">No leads captured in this time range</p>
        <p className="text-xs text-gray-300">Leads appear here as visitors convert through your funnel</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0A9AFF" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#0A9AFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => {
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            labelFormatter={(v) => formatDate(String(v))}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#0A9AFF"
            strokeWidth={2}
            fill="url(#leadGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
