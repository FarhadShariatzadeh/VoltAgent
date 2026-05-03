"use client";

import { TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import type { DashboardData } from "@/lib/api";

interface Props {
  data?: DashboardData;
  loading?: boolean;
}

export function BillForecastCard({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="bg-background border rounded-lg p-5 flex items-center justify-center h-[120px]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const bill = data.bill_forecast_dollars;
  const kwh = data.kwh_used_this_month;
  const tierLimit = data.tier1_limit_kwh;
  const inTier2 = kwh > tierLimit;

  return (
    <div className="bg-background border rounded-lg p-5">
      <p className="text-sm text-muted-foreground mb-1">Forecasted Bill</p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold">${bill.toFixed(2)}</span>
        <span className="text-muted-foreground text-sm mb-0.5">this month</span>
      </div>
      <div className={`flex items-center gap-1 mt-2 text-sm ${inTier2 ? "text-red-600" : "text-green-600"}`}>
        {inTier2 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span>{inTier2 ? "In Tier 2 — higher rates apply" : "Staying in Tier 1 rate"}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Based on {kwh.toFixed(1)} kWh used so far. Updated every 15 min.
      </p>
    </div>
  );
}
