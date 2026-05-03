import { DashboardNav } from "@/components/layout/DashboardNav";
import { UtilityConnectionCard } from "@/components/settings/UtilityConnectionCard";
import { NotificationPreferencesCard } from "@/components/settings/NotificationPreferencesCard";
import { BillUploadCard } from "@/components/settings/BillUploadCard";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <UtilityConnectionCard />
        <BillUploadCard />
        <NotificationPreferencesCard />
      </main>
    </div>
  );
}
