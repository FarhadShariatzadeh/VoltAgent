"use client";

import { Clock, Loader2 } from "lucide-react";
import type { DashboardData } from "@/lib/api";

const PERIOD_STYLES: Record<string, string> = {
  peak: "text-red-600 bg-red-50",
  "off-peak": "text-green-600 bg-green-50",
  "super-off-peak": "text-blue-600 bg-blue-50",
};

const PERIOD_TIPS: Record<string, string> = {
  peak: "Avoid running heavy appliances right now to save.",
  "off-peak": "Great time to run laundry, dishwasher, or charge EVs.",
  "super-off-peak": "Cheapest rates — ideal for EV charging overnight.",
};

interface Props {
  data?: DashboardData;
  loading?: boolean;
}

export function TOUStatusCard({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="bg-background border rounded-lg p-5 flex items-center justify-center h-[120px]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const period = data.current_rate_period;
  const rateCents = data.current_rate_cents_per_kwh;
  const styleClass = PERIOD_STYLES[period] ?? "text-gray-600 bg-gray-50";
  const tip = PERIOD_TIPS[period] ?? "";

  return (
    <div className="bg-background border rounded-lg p-5">
      <p className="text-sm text-muted-foreground mb-1">Current Rate</p>
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium capitalize mt-1 ${styleClass}`}>
        <Clock className="h-3.5 w-3.5" />
        {period}
      </div>
      <p className="text-sm mt-3">
        <span className="font-medium">${(rateCents / 100).toFixed(3)}/kWh</span> right now
      </p>
      <p className="text-xs text-muted-foreground mt-1">{tip}</p>
    </div>
  );
}
