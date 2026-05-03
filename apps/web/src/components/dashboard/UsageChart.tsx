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

const MOCK_DATA = [
  { day: "1", kwh: 18 },
  { day: "5", kwh: 22 },
  { day: "10", kwh: 19 },
  { day: "15", kwh: 30 },
  { day: "20", kwh: 25 },
  { day: "25", kwh: 21 },
  { day: "30", kwh: 23 },
];

export function UsageChart() {
  return (
    <div className="bg-background border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Daily Usage (kWh)</h3>
        <span className="text-xs text-muted-foreground">This month</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={MOCK_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(221.2,83.2%,53.3%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(221.2,83.2%,53.3%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "avg", fontSize: 11 }} />
          <Area
            type="monotone"
            dataKey="kwh"
            stroke="hsl(221.2,83.2%,53.3%)"
            fill="url(#usageGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
