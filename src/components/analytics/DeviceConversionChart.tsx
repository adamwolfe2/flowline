"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Monitor } from "lucide-react";

interface DeviceConversionItem {
  deviceType: string | null;
  sessions: number;
  completed: number;
  completionRate: number;
}

interface DeviceConversionChartProps {
  data: DeviceConversionItem[];
}

const DEVICE_COLORS: Record<string, string> = {
  desktop: "#2D6A4F",
  mobile: "#52B788",
  tablet: "#74C69D",
  unknown: "#B7E4C7",
};

function displayDevice(deviceType: string | null): string {
  if (!deviceType) return "Unknown";
  return deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
}

function getDeviceColor(deviceType: string | null): string {
  return DEVICE_COLORS[deviceType ?? "unknown"] ?? "#B7E4C7";
}

export function DeviceConversionChart({ data }: DeviceConversionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
        <Monitor className="w-8 h-8 text-gray-200" />
        <p className="text-sm text-gray-400">No device data yet</p>
      </div>
    );
  }

  const DEVICE_ORDER = ["desktop", "mobile", "tablet", null];
  const sorted = [...data].sort((a, b) => {
    const ai = DEVICE_ORDER.indexOf(a.deviceType);
    const bi = DEVICE_ORDER.indexOf(b.deviceType);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const chartData = sorted.map((d) => ({
    ...d,
    label: displayDevice(d.deviceType),
    color: getDeviceColor(d.deviceType),
  }));

  // Detect mobile vs desktop disparity
  const desktop = data.find((d) => d.deviceType === "desktop");
  const mobile = data.find((d) => d.deviceType === "mobile");
  const showDisparity =
    desktop && mobile && desktop.completionRate - mobile.completionRate >= 10;

  return (
    <div className="space-y-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            barGap={4}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
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
              width={32}
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
                if (name === "completionRate") return [`${v}%`, "Completion Rate"];
                return [String(value), String(name ?? "")];
              }}
            />
            <Bar yAxisId="sessions" dataKey="sessions" radius={[3, 3, 0, 0]} maxBarSize={48}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.color} fillOpacity={0.9} />
              ))}
            </Bar>
            <Bar yAxisId="cvr" dataKey="completionRate" radius={[3, 3, 0, 0]} maxBarSize={48} fill="#E5E7EB">
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.color} fillOpacity={0.4} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#2D6A4F]" />
          Sessions (solid)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#2D6A4F] opacity-40" />
          Completion % (light)
        </span>
      </div>

      {/* Stats rows */}
      <div className="space-y-2 pt-1 border-t border-gray-50">
        {chartData.map((d) => (
          <div key={d.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-gray-700 font-medium">{d.label}</span>
            </div>
            <span className="text-gray-400 shrink-0">
              {d.sessions.toLocaleString()} sessions
              <span className="ml-2 text-[#2D6A4F] font-semibold">{d.completionRate}%</span>
            </span>
          </div>
        ))}
      </div>

      {showDisparity && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Mobile completion rate is {desktop!.completionRate - mobile!.completionRate}% lower than desktop — consider optimizing your mobile experience.
        </p>
      )}
    </div>
  );
}
