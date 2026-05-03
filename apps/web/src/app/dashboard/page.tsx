import { BillForecastCard } from "@/components/dashboard/BillForecastCard";
import { TOUStatusCard } from "@/components/dashboard/TOUStatusCard";
import { TierTrackerCard } from "@/components/dashboard/TierTrackerCard";
import { VampireAuditCard } from "@/components/dashboard/VampireAuditCard";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { AlertsFeed } from "@/components/dashboard/AlertsFeed";
import { DashboardNav } from "@/components/layout/DashboardNav";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Energy Dashboard</h1>

        {/* Primary KPI row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <BillForecastCard />
          <TOUStatusCard />
          <TierTrackerCard />
          <VampireAuditCard />
        </div>

        {/* Charts + alerts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UsageChart />
          </div>
          <AlertsFeed />
        </div>
      </main>
    </div>
  );
}
