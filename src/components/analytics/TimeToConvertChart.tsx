"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Timer } from "lucide-react";

interface TimeToConvertItem {
  bucket: "0-1min" | "1-5min" | "5-30min" | "30min+" | string;
  count: number;
}

interface TimeToConvertChartProps {
  data: TimeToConvertItem[];
}

const BUCKET_COLORS: Record<string, string> = {
  "0-1min": "#52B788",
  "1-5min": "#2D6A4F",
  "5-30min": "#1B4332",
  "30min+": "#95A5A6",
};

const BUCKET_LABELS: Record<string, string> = {
  "0-1min": "< 1 min",
  "1-5min": "1–5 min",
  "5-30min": "5–30 min",
  "30min+": "30+ min",
};

export function TimeToConvertChart({ data }: TimeToConvertChartProps) {
  const total = data.reduce((s, d) => s + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
        <Timer className="w-8 h-8 text-gray-200" />
        <p className="text-sm text-gray-400">No conversion time data yet</p>
        <p className="text-xs text-gray-300">Data appears once users convert through your funnel</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: BUCKET_LABELS[d.bucket] ?? d.bucket,
    color: BUCKET_COLORS[d.bucket] ?? "#2D6A4F",
    pct: total > 0 ? Math.round((d.count / total) * 100) : 0,
  }));

  const peakBucket = chartData.reduce((best, d) => (d.count > best.count ? d : best), chartData[0]);

  return (
    <div className="space-y-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              formatter={(value: unknown) => {
                const v = Number(value);
                const pct = total > 0 ? Math.round((v / total) * 100) : 0;
                return [`${v.toLocaleString()} (${pct}%)`, "Converters"];
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary insight */}
      {peakBucket && peakBucket.count > 0 && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          Most converters complete in{" "}
          <span className="font-semibold text-[#2D6A4F]">{peakBucket.label}</span>
          {" "}— {peakBucket.pct}% of {total.toLocaleString()} total converters
        </p>
      )}

      {/* Bucket breakdown */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-50">
        {chartData.map((d) => (
          <div key={d.bucket} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-gray-600 truncate">{d.label}</span>
            <span className="ml-auto text-gray-400 font-medium shrink-0">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
