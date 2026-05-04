"use client";

import type { DashboardData } from "@/lib/api";

interface Props { data?: DashboardData; loading?: boolean }

export function TierTrackerCard({ data, loading }: Props) {
  if (loading || !data) return <SkeletonCard />;

  const used = data.kwh_used_this_month;
  const limit = data.tier1_limit_kwh;
  const pct = Math.min((used / limit) * 100, 100);
  const inTier2 = used > limit;
  const remaining = Math.max(0, limit - used);

  const barColor = inTier2 ? "bg-red-500" : pct > 80 ? "bg-amber-400" : "bg-blue-500";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tier Usage</p>
        <span className="text-xs text-slate-400">{limit} kWh limit</span>
      </div>
      <div>
        <p className="text-4xl font-bold text-slate-900">
          {used.toFixed(0)}
          <span className="text-base font-normal text-slate-400"> kWh</span>
        </p>
      </div>
      <div className="space-y-1.5">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-slate-500">
          {inTier2
            ? `${(used - limit).toFixed(0)} kWh in Tier 2 — 42% higher rate`
            : `${remaining.toFixed(0)} kWh left before Tier 2`}
        </p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
      <div className="h-3 w-24 bg-slate-100 rounded mb-4" />
      <div className="h-10 w-28 bg-slate-100 rounded mb-4" />
      <div className="h-2 w-full bg-slate-100 rounded" />
    </div>
  );
}
