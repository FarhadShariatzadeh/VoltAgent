"use client";

import { Zap, Loader2, CheckCircle } from "lucide-react";
import type { DashboardData } from "@/lib/api";

interface Props {
  data?: DashboardData;
  loading?: boolean;
}

export function VampireAuditCard({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="bg-background border rounded-lg p-5 flex items-center justify-center h-[120px]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cost = data.vampire_monthly_cost_dollars;
  const devices = data.vampire_devices_flagged;
  const hasVampires = devices > 0;

  return (
    <div className="bg-background border rounded-lg p-5">
      <p className="text-sm text-muted-foreground mb-1">Vampire Power</p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold">${cost.toFixed(2)}</span>
        <span className="text-muted-foreground text-sm mb-0.5">/month</span>
      </div>
      {hasVampires ? (
        <div className="flex items-center gap-1 mt-2 text-sm text-yellow-600">
          <Zap className="h-4 w-4" />
          <span>{devices} device{devices !== 1 ? "s" : ""} flagged</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>No standby loads detected</span>
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-3">
        Standby power detected during quiet hours (midnight–6 AM).
      </p>
    </div>
  );
}
