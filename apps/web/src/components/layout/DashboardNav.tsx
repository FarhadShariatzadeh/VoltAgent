"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LayoutDashboard, Settings, LogOut, Target } from "lucide-react";

export function DashboardNav() {
  const path = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/challenge", label: "Sprint", icon: Target },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  function signOut() {
    localStorage.removeItem("access_token");
    window.location.href = "/auth/login";
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm px-6 py-0 flex items-center justify-between h-14 shadow-sm">
      <div className="flex items-center gap-6">
        <a href="/" className="flex items-center gap-2 font-bold text-blue-600 shrink-0 cursor-pointer">
          <Zap className="h-5 w-5" />
          VoltAgent
        </a>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <button
        onClick={signOut}
        className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </nav>
  );
}
