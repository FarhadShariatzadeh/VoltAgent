"use client";

import { Loader2 } from "lucide-react";
import type { DashboardData } from "@/lib/api";

interface Props {
  data?: DashboardData;
  loading?: boolean;
}

export function TierTrackerCard({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="bg-background border rounded-lg p-5 flex items-center justify-center h-[120px]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const usedKwh = data.kwh_used_this_month;
  const tierLimit = data.tier1_limit_kwh;
  const pct = Math.min((usedKwh / tierLimit) * 100, 100);
  const remaining = Math.max(0, tierLimit - usedKwh);
  const inTier2 = usedKwh > tierLimit;

  return (
    <div className="bg-background border rounded-lg p-5">
      <p className="text-sm text-muted-foreground mb-1">Tier Usage</p>
      <p className="text-3xl font-bold">
        {usedKwh.toFixed(0)}{" "}
        <span className="text-base font-normal text-muted-foreground">
          / {tierLimit} kWh
        </span>
      </p>

      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            inTier2 ? "bg-red-500" : pct > 85 ? "bg-yellow-500" : "bg-primary"
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        {inTier2
          ? `${(usedKwh - tierLimit).toFixed(0)} kWh in Tier 2 — higher rate applies.`
          : `${remaining.toFixed(0)} kWh left in Tier 1 — next tier costs ~42% more.`}
      </p>
    </div>
  );
}
