"use client";

import { Zap, CheckCircle } from "lucide-react";
import type { DashboardData } from "@/lib/api";

interface Props { data?: DashboardData; loading?: boolean }

export function VampireAuditCard({ data, loading }: Props) {
  if (loading || !data) return <SkeletonCard />;

  const cost = data.vampire_monthly_cost_dollars;
  const devices = data.vampire_devices_flagged;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Vampire Power</p>
        <Zap className="h-4 w-4 text-slate-300" />
      </div>
      <div>
        <p className="text-4xl font-bold text-slate-900">${cost.toFixed(2)}<span className="text-base font-normal text-slate-400">/mo</span></p>
      </div>
      {devices > 0 ? (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <Zap className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 font-medium">{devices} device{devices !== 1 ? "s" : ""} flagged</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">No standby loads detected</p>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
      <div className="h-3 w-24 bg-slate-100 rounded mb-4" />
      <div className="h-10 w-24 bg-slate-100 rounded mb-3" />
      <div className="h-8 w-full bg-slate-100 rounded" />
    </div>
  );
}
