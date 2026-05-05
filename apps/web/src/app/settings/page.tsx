import { DashboardNav } from "@/components/layout/DashboardNav";
import { UtilityConnectionCard } from "@/components/settings/UtilityConnectionCard";
import { NotificationPreferencesCard } from "@/components/settings/NotificationPreferencesCard";
import { BillUploadCard } from "@/components/settings/BillUploadCard";
import { Settings2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
            <Settings2 className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-400">Manage your utility connection and notification preferences.</p>
          </div>
        </div>

        <UtilityConnectionCard />
        <BillUploadCard />
        <NotificationPreferencesCard />
      </main>
    </div>
  );
}
