"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Database,
  Info,
  Loader2,
  Zap,
} from "lucide-react";
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
      await apiClient.post<{ records_imported: number }>("/utility/seed-demo-data", {});
      setSeedDone(true);
      setConnected(true);
      setConnectedProvider("pse");
    } catch {
      setSeedError("Failed to load demo data. Make sure the API is running and try again.");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-slate-50">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-blue-600" />
          </div>
          <h2 className="font-semibold text-slate-900">Utility Connection</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Connect your utility account to pull 15-minute interval data. Read-only — your credentials are never stored.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {loadingStatus ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking connection status…
          </div>
        ) : connected ? (
          /* ── Connected state ── */
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Connected</p>
                  <p className="text-xs text-slate-400">{connectedLabel}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setConnected(false);
                  setConnectedProvider(null);
                  setSeedDone(false);
                }}
                className="text-xs text-red-400 hover:text-red-600 hover:underline transition"
              >
                Disconnect
              </button>
            </div>

            {seedDone ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-4">
                <p className="text-sm font-semibold text-emerald-800 mb-1">✓ 30 days of data loaded!</p>
                <p className="text-xs text-emerald-700">Head to the Dashboard to see your forecasts, TOU status, and usage chart.</p>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Load demo data</p>
                <p className="text-sm text-slate-600">
                  Populate your dashboard with 30 days of realistic 15-minute interval usage data so you can explore every feature right now.
                </p>
                {seedError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg px-3 py-2">
                    {seedError}
                  </div>
                )}
                <button
                  onClick={handleSeedDemo}
                  disabled={seeding}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed w-full justify-center"
                >
                  {seeding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  {seeding ? "Generating data…" : "Load 30 Days of Demo Data →"}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── Not connected state ── */
          <div className="space-y-5">
            {/* Option 1: Demo data — recommended */}
            <div className="border-2 border-blue-500 rounded-xl p-5 space-y-3 relative">
              <span className="absolute -top-2.5 left-4 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                RECOMMENDED
              </span>
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Load Demo Data (instant)</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Generates 30 days of realistic 15-min interval data — no utility account needed. Explore every feature immediately.
                  </p>
                </div>
              </div>
              {seedError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg px-3 py-2">
                  {seedError}
                </div>
              )}
              <button
                onClick={handleSeedDemo}
                disabled={seeding}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed w-full"
              >
                {seeding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                {seeding ? "Generating 30 days of data…" : "Load Demo Data (30 days)"}
              </button>
            </div>

            {/* Option 2: Real Green Button — requires dev registration */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-3 opacity-75">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Connect Real Utility Account</p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Requires Green Button OAuth credentials from your utility provider.
                  </p>
                </div>
              </div>

              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-slate-600"
              >
                {UTILITIES.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Production Green Button OAuth requires registering your app at your utility's developer portal (e.g. <strong>pse.com/developer</strong>) to obtain a <code>CLIENT_ID</code> and <code>CLIENT_SECRET</code>. Set those in <code>apps/api/.env</code> to enable live connectivity.
                </p>
              </div>

              <button
                disabled
                className="flex items-center justify-center gap-2 border border-slate-200 text-slate-400 px-5 py-2.5 rounded-lg text-sm font-semibold w-full cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
                Connect via Green Button (requires API credentials)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
