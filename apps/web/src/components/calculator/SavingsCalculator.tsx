"use client";

import { useState } from "react";

const UTILITY_TIER_RATES: Record<string, { tier1: number; tier2: number; threshold: number }> = {
  pse: { tier1: 0.112, tier2: 0.159, threshold: 600 },
  seattle_city_light: { tier1: 0.104, tier2: 0.104, threshold: Infinity },
  tacoma_power: { tier1: 0.096, tier2: 0.138, threshold: 600 },
};

export function SavingsCalculator() {
  const [utility, setUtility] = useState("pse");
  const [monthlyKwh, setMonthlyKwh] = useState(800);
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const rates = UTILITY_TIER_RATES[utility];
    const tier1Kwh = Math.min(monthlyKwh, rates.threshold);
    const tier2Kwh = Math.max(0, monthlyKwh - rates.threshold);
    const currentBill = tier1Kwh * rates.tier1 + tier2Kwh * rates.tier2;

    // Estimate 12% reduction from TOU optimization + load shifting
    const optimizedBill = currentBill * 0.88;
    setResult(Math.round((currentBill - optimizedBill) * 100) / 100);
  };

  return (
    <div className="bg-background border rounded-xl p-6 shadow-sm space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">Utility provider</label>
        <select
          value={utility}
          onChange={(e) => setUtility(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="pse">Puget Sound Energy (PSE)</option>
          <option value="seattle_city_light">Seattle City Light</option>
          <option value="tacoma_power">Tacoma Power</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Average monthly usage:{" "}
          <span className="text-primary">{monthlyKwh} kWh</span>
        </label>
        <input
          type="range"
          min={200}
          max={2000}
          step={50}
          value={monthlyKwh}
          onChange={(e) => setMonthlyKwh(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>200 kWh</span>
          <span>2,000 kWh</span>
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Calculate my savings
      </button>

      {result !== null && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-sm text-green-700 mb-1">Estimated monthly savings</p>
          <p className="text-4xl font-bold text-green-700">${result}</p>
          <p className="text-xs text-green-600 mt-2">
            Based on 12% average load optimization across VoltAgent users.
          </p>
        </div>
      )}
    </div>
  );
}
