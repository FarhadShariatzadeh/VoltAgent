"use client";

import { useState } from "react";
import { CheckCircle2, Link2 } from "lucide-react";

export function UtilityConnectionCard() {
  const [connected, setConnected] = useState(false);

  return (
    <div className="bg-background border rounded-lg p-6">
      <h2 className="font-semibold text-lg mb-1">Utility Connection</h2>
      <p className="text-sm text-muted-foreground mb-5">
        Connect via Green Button to give VoltAgent access to your 15-minute
        interval usage data. We use OAuth — your credentials are never stored.
      </p>

      {connected ? (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <CheckCircle2 className="h-5 w-5" />
          Connected to Puget Sound Energy
        </div>
      ) : (
        <div className="space-y-3">
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Select your utility provider…</option>
            <option value="pse">Puget Sound Energy (PSE)</option>
            <option value="seattle_city_light">Seattle City Light</option>
            <option value="tacoma_power">Tacoma Power</option>
            <option value="snohomish_pud">Snohomish PUD</option>
          </select>
          <button
            onClick={() => setConnected(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Link2 className="h-4 w-4" />
            Connect via Green Button
          </button>
        </div>
      )}
    </div>
  );
}
