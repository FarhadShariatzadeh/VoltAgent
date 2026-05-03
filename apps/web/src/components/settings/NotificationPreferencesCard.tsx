"use client";

import { useState } from "react";

type Channel = "email" | "sms";
type AlertType = "tou" | "tier" | "forecast" | "vampire";

const ALERT_LABELS: Record<AlertType, string> = {
  tou: "Peak hour warnings",
  tier: "Tier threshold alerts",
  forecast: "Bill forecast updates",
  vampire: "Vampire power detections",
};

export function NotificationPreferencesCard() {
  const [channels, setChannels] = useState<Record<Channel, boolean>>({
    email: true,
    sms: false,
  });
  const [alerts, setAlerts] = useState<Record<AlertType, boolean>>({
    tou: true,
    tier: true,
    forecast: true,
    vampire: true,
  });

  const toggle = <T extends string>(
    setter: React.Dispatch<React.SetStateAction<Record<T, boolean>>>,
    key: T
  ) => setter((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="bg-background border rounded-lg p-6">
      <h2 className="font-semibold text-lg mb-5">Notification Preferences</h2>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Channels
        </h3>
        <div className="space-y-3">
          {(["email", "sms"] as Channel[]).map((ch) => (
            <label key={ch} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm capitalize">{ch === "sms" ? "SMS / Text message" : "Email"}</span>
              <button
                role="switch"
                aria-checked={channels[ch]}
                onClick={() => toggle(setChannels, ch)}
                className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${channels[ch] ? "bg-primary" : "bg-muted"}`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${channels[ch] ? "translate-x-4" : "translate-x-0.5"}`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Alert types
        </h3>
        <div className="space-y-3">
          {(Object.keys(ALERT_LABELS) as AlertType[]).map((key) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">{ALERT_LABELS[key]}</span>
              <button
                role="switch"
                aria-checked={alerts[key]}
                onClick={() => toggle(setAlerts, key)}
                className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${alerts[key] ? "bg-primary" : "bg-muted"}`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${alerts[key] ? "translate-x-4" : "translate-x-0.5"}`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      <button className="mt-6 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
        Save preferences
      </button>
    </div>
  );
}
