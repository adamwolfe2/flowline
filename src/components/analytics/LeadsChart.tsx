"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
      <p className="text-sm text-gray-400 text-center py-12">
        No leads captured in this time range
      </p>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
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
            stroke="#2D6A4F"
            strokeWidth={2}
            fill="url(#leadGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
