"use client";

import { useState } from "react";
import { CheckCircle2, Link2, Zap } from "lucide-react";

const UTILITIES = [
  { value: "pse", label: "Puget Sound Energy (PSE)" },
  { value: "seattle_city_light", label: "Seattle City Light" },
  { value: "tacoma_power", label: "Tacoma Power" },
  { value: "snohomish_pud", label: "Snohomish PUD" },
];

export function UtilityConnectionCard() {
  const [selected, setSelected] = useState("");
  const [connected, setConnected] = useState(false);

  const connectedLabel = UTILITIES.find((u) => u.value === selected)?.label ?? "your utility";

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
        {connected ? (
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
              onClick={() => setConnected(false)}
              className="text-xs text-red-500 hover:text-red-700 hover:underline transition"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
            >
              <option value="">Select your utility provider…</option>
              {UTILITIES.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
            <button
              onClick={() => selected && setConnected(true)}
              disabled={!selected}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Link2 className="h-4 w-4" />
              Connect via Green Button
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
