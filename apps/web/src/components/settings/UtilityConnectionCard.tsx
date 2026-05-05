"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Database, ExternalLink, Loader2, Zap } from "lucide-react";
import { apiClient } from "@/lib/api";

const UTILITIES = [
  { value: "pse", label: "Puget Sound Energy (PSE)" },
  { value: "seattle_city_light", label: "Seattle City Light" },
  { value: "tacoma_power", label: "Tacoma Power" },
  { value: "snohomish_pud", label: "Snohomish PUD" },
];

export function UtilityConnectionCard() {
  const [selected, setSelected] = useState("pse");
  const [connected, setConnected] = useState(false);
  const [connectedProvider, setConnectedProvider] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Load real connection status on mount
  useEffect(() => {
    apiClient
      .get<{ connections: { provider: string; connected: boolean }[] }>("/utility/status")
      .then((res) => {
        const active = res.connections.find((c) => c.connected);
        if (active) {
          setConnected(true);
          setConnectedProvider(active.provider);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStatus(false));
  }, []);

  const connectedLabel =
    UTILITIES.find((u) => u.value === connectedProvider)?.label ??
    connectedProvider ??
    "your utility";

  async function handleSeedDemo() {
    setSeeding(true);
    setSeedError(null);
    try {
      const res = await apiClient.post<{ records_imported: number; days: number }>(
        "/utility/seed-demo-data",
        {}
      );
      setSeedDone(true);
      setConnected(true);
      setConnectedProvider("pse");
      // Small delay so user sees the success state, then reload dashboard data
      setTimeout(() => window.dispatchEvent(new Event("voltagent:data-loaded")), 800);
      return res;
    } catch {
      setSeedError("Failed to load demo data. Please try again.");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-5 border-b border-slate-50">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-blue-600" />
          </div>
          <h2 className="font-semibold text-slate-900">Utility Connection</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Connect via Green Button OAuth for 15-minute interval data. Read-only — your credentials are never stored.
        </p>
      </div>

      <div className="p-6">
        {loadingStatus ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking connection…
          </div>
        ) : connected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Connected</p>
                  <p className="text-xs text-slate-400">{connectedLabel}</p>
                </div>
              </div>
              <button
                onClick={() => { setConnected(false); setConnectedProvider(null); setSeedDone(false); }}
                className="text-xs text-red-500 hover:text-red-700 hover:underline transition"
              >
                Disconnect
              </button>
            </div>
            {seedDone && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 text-sm text-emerald-700">
                ✓ 30 days of demo data loaded — go check your dashboard!
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
              >
                {UTILITIES.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>

              {/* Green Button — requires real utility OAuth registration */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                <ExternalLink className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">Green Button OAuth</span> requires registering as an authorized app with your utility provider. Contact your utility to get production API credentials.
                </p>
              </div>
            </div>

            {/* Demo data — works immediately */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">Try with demo data</p>
              {seedError && (
                <div className="mb-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg px-3 py-2">
                  {seedError}
                </div>
              )}
              <button
                onClick={handleSeedDemo}
                disabled={seeding}
                className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {seeding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                {seeding ? "Loading 30 days of data…" : "Load Demo Data (30 days)"}
              </button>
              <p className="text-xs text-slate-400 mt-2">
                Generates realistic 15-min interval data so you can explore all dashboard features immediately.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
