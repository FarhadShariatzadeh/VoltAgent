"use client";

import { useEffect, useState } from "react";
import { BillForecastCard } from "@/components/dashboard/BillForecastCard";
import { TOUStatusCard } from "@/components/dashboard/TOUStatusCard";
import { TierTrackerCard } from "@/components/dashboard/TierTrackerCard";
import { VampireAuditCard } from "@/components/dashboard/VampireAuditCard";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { AlertsFeed } from "@/components/dashboard/AlertsFeed";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { dashboardApi, alertsApi, type DashboardData, type UsagePoint, type AlertItem } from "@/lib/api";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardData | undefined>();
  const [usage, setUsage] = useState<UsagePoint[] | undefined>();
  const [alerts, setAlerts] = useState<AlertItem[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [s, u, a] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getUsageHistory(30),
        alertsApi.list(10),
      ]);
      setSummary(s);
      setUsage(u);
      setAlerts(a);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard load failed:", err);
      // Show empty-state cards rather than indefinite skeleton
      setSummary(undefined);
      setUsage([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Energy Dashboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Loading…"}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-40 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BillForecastCard data={summary} loading={loading} />
          <TOUStatusCard data={summary} loading={loading} />
          <TierTrackerCard data={summary} loading={loading} />
          <VampireAuditCard data={summary} loading={loading} />
        </div>

        {/* Chart + alerts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UsageChart data={usage} loading={loading} />
          </div>
          <AlertsFeed alerts={alerts} loading={loading} />
        </div>

        {/* Empty state CTA */}
        {!loading && !summary && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <p className="text-slate-500 text-sm">Connect your utility account in Settings to start seeing real data.</p>
          </div>
        )}
      </main>
    </div>
  );
}
