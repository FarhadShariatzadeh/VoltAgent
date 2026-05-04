"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import type { DashboardData } from "@/lib/api";

interface Props { data?: DashboardData; loading?: boolean }

export function BillForecastCard({ data, loading }: Props) {
  if (loading || !data) return <SkeletonCard />;

  const bill = data.bill_forecast_dollars;
  const kwh = data.kwh_used_this_month;
  const inTier2 = kwh > data.tier1_limit_kwh;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Forecasted Bill</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inTier2 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
          {inTier2 ? "Tier 2" : "Tier 1"}
        </span>
      </div>
      <div>
        <p className="text-4xl font-bold text-slate-900">${bill.toFixed(2)}</p>
        <p className="text-sm text-slate-400 mt-0.5">projected this month</p>
      </div>
      <div className={`flex items-center gap-1.5 text-sm font-medium ${inTier2 ? "text-red-500" : "text-emerald-600"}`}>
        {inTier2 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {inTier2 ? "In higher-rate tier" : `${kwh.toFixed(0)} kWh · on track`}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
      <div className="h-3 w-24 bg-slate-100 rounded mb-4" />
      <div className="h-10 w-32 bg-slate-100 rounded mb-2" />
      <div className="h-3 w-20 bg-slate-100 rounded" />
    </div>
  );
}
