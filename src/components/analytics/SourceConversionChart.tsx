"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp } from "lucide-react";

interface SourceConversionItem {
  source: string | null;
  sessions: number;
  conversions: number;
  conversionRate: number;
}

interface SourceConversionChartProps {
  data: SourceConversionItem[];
}

const BRAND_COLOR = "#2D6A4F";
const ACCENT_COLOR = "#52B788";

function displaySource(source: string | null): string {
  if (!source) return "Direct";
  return source;
}

export function SourceConversionChart({ data }: SourceConversionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
        <TrendingUp className="w-8 h-8 text-gray-200" />
        <p className="text-sm text-gray-400">No traffic source data yet</p>
        <p className="text-xs text-gray-300">Add UTM parameters to your funnel links to see source data</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: displaySource(d.source),
  }));

  const top3 = chartData.slice(0, 3);
  const totalSessions = chartData.reduce((s, d) => s + d.sessions, 0) || 1;

  return (
    <div className="space-y-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            barGap={2}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              interval={0}
              tickFormatter={(v: string) => v.length > 8 ? `${v.slice(0, 7)}…` : v}
            />
            <YAxis
              yAxisId="sessions"
              orientation="left"
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <YAxis
              yAxisId="cvr"
              orientation="right"
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              width={28}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: unknown, name: any) => {
                const v = Number(value);
                if (name === "sessions") return [v.toLocaleString(), "Sessions"];
                if (name === "conversionRate") return [`${v}%`, "CVR"];
                return [String(value), String(name ?? "")];
              }}
            />
            <Bar yAxisId="sessions" dataKey="sessions" radius={[3, 3, 0, 0]} maxBarSize={40}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={BRAND_COLOR} fillOpacity={0.85} />
              ))}
            </Bar>
            <Bar yAxisId="cvr" dataKey="conversionRate" radius={[3, 3, 0, 0]} maxBarSize={40}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={ACCENT_COLOR} fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: BRAND_COLOR }} />
          Sessions
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: ACCENT_COLOR }} />
          CVR %
        </span>
      </div>

      {/* Top 3 text summary */}
      <div className="space-y-1.5 pt-1 border-t border-gray-50">
        {top3.map((d) => {
          const pct = Math.round((d.sessions / totalSessions) * 100);
          return (
            <div key={d.label} className="flex items-center justify-between text-xs">
              <span className="text-gray-700 font-medium truncate max-w-[55%]">{d.label}</span>
              <span className="text-gray-400 shrink-0">
                {d.sessions.toLocaleString()} sessions ({pct}%)
                <span className="ml-2 text-[#2D6A4F] font-semibold">{d.conversionRate}% CVR</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
