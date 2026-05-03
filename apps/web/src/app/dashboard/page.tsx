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

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardData | undefined>();
  const [usage, setUsage] = useState<UsagePoint[] | undefined>();
  const [alerts, setAlerts] = useState<AlertItem[] | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [s, u, a] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getUsageHistory(30),
          alertsApi.list(10),
        ]);
        if (!cancelled) {
          setSummary(s);
          setUsage(u);
          setAlerts(a);
        }
      } catch {
        // If unauthenticated, data stays undefined and cards show skeletons
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Energy Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <BillForecastCard data={summary} loading={loading} />
          <TOUStatusCard data={summary} loading={loading} />
          <TierTrackerCard data={summary} loading={loading} />
          <VampireAuditCard data={summary} loading={loading} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UsageChart data={usage} loading={loading} />
          </div>
          <AlertsFeed alerts={alerts} loading={loading} />
        </div>
      </main>
    </div>
  );
}
