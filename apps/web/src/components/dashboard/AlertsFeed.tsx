"use client";

import { Bell, TrendingUp, Zap, AlertTriangle, Loader2 } from "lucide-react";
import { alertsApi, type AlertItem } from "@/lib/api";

const TYPE_ICONS: Record<string, React.ElementType> = {
  tou_warning: AlertTriangle,
  bill_forecast: TrendingUp,
  vampire_power: Zap,
  tier_warning: TrendingUp,
  spike_detected: Zap,
};

const TYPE_COLORS: Record<string, string> = {
  tou_warning: "text-yellow-600",
  bill_forecast: "text-green-600",
  vampire_power: "text-blue-600",
  tier_warning: "text-red-600",
  spike_detected: "text-orange-600",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  alerts?: AlertItem[];
  loading?: boolean;
}

export function AlertsFeed({ alerts, loading }: Props) {
  return (
    <div className="bg-background border rounded-lg p-5">
      <h3 className="font-semibold mb-4">Agent Alerts</h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
          <Bell className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No alerts yet — your agent is watching.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {alerts.map((a) => {
            const Icon = TYPE_ICONS[a.alert_type] ?? Bell;
            const color = TYPE_COLORS[a.alert_type] ?? "text-gray-600";
            return (
              <li key={a.id} className={`flex gap-3 ${!a.read ? "" : "opacity-60"}`}>
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.body}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-auto">
                  {timeAgo(a.created_at)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
