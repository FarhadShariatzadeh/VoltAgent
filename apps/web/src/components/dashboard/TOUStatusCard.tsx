"use client";

import { Clock } from "lucide-react";
import type { DashboardData } from "@/lib/api";

const STYLES: Record<string, { badge: string; dot: string; tip: string }> = {
  peak: { badge: "bg-red-50 text-red-700 border-red-100", dot: "bg-red-500", tip: "Avoid heavy appliances right now." },
  "off-peak": { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500", tip: "Great time to run laundry or charge your EV." },
  "super-off-peak": { badge: "bg-blue-50 text-blue-700 border-blue-100", dot: "bg-blue-500", tip: "Cheapest rates — ideal for overnight EV charging." },
};

interface Props { data?: DashboardData; loading?: boolean }

export function TOUStatusCard({ data, loading }: Props) {
  if (loading || !data) return <SkeletonCard />;

  const period = data.current_rate_period;
  const rate = data.current_rate_cents_per_kwh;
  const style = STYLES[period] ?? STYLES["off-peak"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Current Rate</p>
        <Clock className="h-4 w-4 text-slate-300" />
      </div>
      <div>
        <div className={`inline-flex items-center gap-2 border rounded-full px-3 py-1 text-sm font-semibold capitalize ${style.badge}`}>
          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
          {period}
        </div>
        <p className="text-3xl font-bold text-slate-900 mt-3">${(rate / 100).toFixed(3)}<span className="text-base font-normal text-slate-400">/kWh</span></p>
      </div>
      <p className="text-sm text-slate-500">{style.tip}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
      <div className="h-3 w-24 bg-slate-100 rounded mb-4" />
      <div className="h-8 w-28 bg-slate-100 rounded mb-3" />
      <div className="h-10 w-32 bg-slate-100 rounded" />
    </div>
  );
}
