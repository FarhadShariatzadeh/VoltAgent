"use client";

import { Bell, TrendingUp, Zap, AlertTriangle } from "lucide-react";
import type { AlertItem } from "@/lib/api";

const TYPE_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  tou_warning:   { icon: AlertTriangle, color: "text-amber-600",  bg: "bg-amber-50" },
  bill_forecast: { icon: TrendingUp,   color: "text-emerald-600", bg: "bg-emerald-50" },
  vampire_power: { icon: Zap,          color: "text-blue-600",    bg: "bg-blue-50" },
  tier_warning:  { icon: TrendingUp,   color: "text-red-600",     bg: "bg-red-50" },
  spike_detected:{ icon: Zap,          color: "text-orange-600",  bg: "bg-orange-50" },
};

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props { alerts?: AlertItem[]; loading?: boolean }

export function AlertsFeed({ alerts, loading }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Agent Alerts</h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-slate-100 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5 py-1">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center gap-3">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
            <Bell className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">No alerts yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Your agent is watching 24/7.</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((a) => {
            const meta = TYPE_META[a.alert_type] ?? { icon: Bell, color: "text-slate-600", bg: "bg-slate-50" };
            const Icon = meta.icon;
            return (
              <li key={a.id} className={`flex gap-3 ${a.read ? "opacity-50" : ""}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}>
                  <Icon className={`h-4 w-4 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 leading-snug">{a.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{a.body}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0 pt-0.5">{timeAgo(a.created_at)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
