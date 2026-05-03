"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Loader2 } from "lucide-react";
import type { UsagePoint } from "@/lib/api";

interface Props {
  data?: UsagePoint[];
  loading?: boolean;
}

export function UsageChart({ data, loading }: Props) {
  const chartData = (data ?? []).map((p) => ({
    day: new Date(p.interval_start).getDate().toString(),
    kwh: Number(p.kwh.toFixed(2)),
  }));

  const avg = chartData.length
    ? chartData.reduce((s, p) => s + p.kwh, 0) / chartData.length
    : 0;

  return (
    <div className="bg-background border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Daily Usage (kWh)</h3>
        <span className="text-xs text-muted-foreground">This month</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[220px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
          No usage data yet. Connect your utility account to get started.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221.2,83.2%,53.3%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(221.2,83.2%,53.3%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => [`${v} kWh`, "Usage"]} />
            {avg > 0 && (
              <ReferenceLine
                y={avg}
                stroke="#f59e0b"
                strokeDasharray="4 2"
                label={{ value: "avg", fontSize: 11 }}
              />
            )}
            <Area
              type="monotone"
              dataKey="kwh"
              stroke="hsl(221.2,83.2%,53.3%)"
              fill="url(#usageGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
