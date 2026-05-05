"use client";

import { useState } from "react";
import { TrendingDown } from "lucide-react";

const RATES: Record<string, { tier1: number; tier2: number; threshold: number; label: string }> = {
  pse:               { tier1: 0.112, tier2: 0.159, threshold: 600,      label: "Puget Sound Energy (PSE)" },
  seattle_city_light:{ tier1: 0.104, tier2: 0.104, threshold: Infinity, label: "Seattle City Light" },
  tacoma_power:      { tier1: 0.096, tier2: 0.138, threshold: 600,      label: "Tacoma Power" },
};

export function SavingsCalculator() {
  const [utility, setUtility] = useState("pse");
  const [kwh, setKwh] = useState(800);
  const [result, setResult] = useState<{ savings: number; current: number; optimized: number } | null>(null);

  const calculate = () => {
    const r = RATES[utility];
    const t1 = Math.min(kwh, r.threshold);
    const t2 = Math.max(0, kwh - r.threshold);
    const current = t1 * r.tier1 + t2 * r.tier2;
    const optimized = current * 0.88;
    setResult({ savings: Math.round((current - optimized) * 100) / 100, current: Math.round(current * 100) / 100, optimized: Math.round(optimized * 100) / 100 });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Utility provider</label>
          <select
            value={utility}
            onChange={(e) => setUtility(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {Object.entries(RATES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700">Monthly usage</label>
            <span className="text-sm font-bold text-blue-600">{kwh.toLocaleString()} kWh</span>
          </div>
          <input
            type="range" min={200} max={2000} step={50} value={kwh}
            onChange={(e) => setKwh(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>200 kWh</span><span>2,000 kWh</span>
          </div>
        </div>

        <button
          onClick={calculate}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          Calculate my savings
        </button>
      </div>

      {result && (
        <div className="border-t border-slate-100 bg-emerald-50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-emerald-800">Estimated monthly savings</p>
          </div>
          <p className="text-5xl font-extrabold text-emerald-700 mb-1">${result.savings}</p>
          <p className="text-sm text-emerald-600 mb-4">that's <strong>${result.savings * 12}</strong> per year</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border border-emerald-100">
              <p className="text-xs text-slate-400 mb-0.5">Current bill</p>
              <p className="text-lg font-bold text-slate-700">${result.current}</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-emerald-100">
              <p className="text-xs text-slate-400 mb-0.5">With VoltAgent</p>
              <p className="text-lg font-bold text-emerald-600">${result.optimized}</p>
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-3 text-center">Based on 12% average load optimization across VoltAgent users.</p>
        </div>
      )}
    </div>
  );
}
