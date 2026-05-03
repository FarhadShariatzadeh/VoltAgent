import Link from "next/link";
import { Zap, LayoutDashboard, Settings, LogOut, Target } from "lucide-react";

export function DashboardNav() {
  return (
    <nav className="border-b bg-background px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Zap className="text-primary h-5 w-5" />
          VoltAgent
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/challenge"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm hover:bg-muted transition-colors"
          >
            <Target className="h-4 w-4" />
            Sprint
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm hover:bg-muted transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors">
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </nav>
  );
}
