"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare } from "lucide-react";

type Channel = "email" | "sms";
type AlertType = "tou" | "tier" | "forecast" | "vampire";

const CHANNELS: { key: Channel; label: string; sub: string; icon: React.ElementType }[] = [
  { key: "email", label: "Email", sub: "Receive alerts in your inbox", icon: Mail },
  { key: "sms", label: "SMS / Text", sub: "Requires phone number on account", icon: MessageSquare },
];

const ALERT_TYPES: { key: AlertType; label: string; sub: string }[] = [
  { key: "tou", label: "Peak hour warnings", sub: "Before expensive TOU windows open" },
  { key: "tier", label: "Tier threshold alerts", sub: "When you're close to crossing tiers" },
  { key: "forecast", label: "Bill forecast updates", sub: "Weekly projection of your bill" },
  { key: "vampire", label: "Vampire power detections", sub: "Unusual overnight standby loads" },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${on ? "bg-blue-600" : "bg-slate-200"}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 mt-0.5 ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

export function NotificationPreferencesCard() {
  const [channels, setChannels] = useState<Record<Channel, boolean>>({ email: true, sms: false });
  const [alerts, setAlerts] = useState<Record<AlertType, boolean>>({ tou: true, tier: true, forecast: true, vampire: true });
  const [saved, setSaved] = useState(false);

  const toggle = <T extends string>(
    setter: React.Dispatch<React.SetStateAction<Record<T, boolean>>>,
    key: T
  ) => setter((p) => ({ ...p, [key]: !p[key] }));

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-5 border-b border-slate-50">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <Bell className="h-4 w-4 text-amber-600" />
          </div>
          <h2 className="font-semibold text-slate-900">Notification Preferences</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">Choose how and when your AI agent contacts you.</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Channels */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Delivery channels</p>
          <div className="space-y-1">
            {CHANNELS.map(({ key, label, sub, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between py-2.5 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{label}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </div>
                </div>
                <Toggle on={channels[key]} onToggle={() => toggle(setChannels, key)} />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-50" />

        {/* Alert types */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Alert types</p>
          <div className="space-y-1">
            {ALERT_TYPES.map(({ key, label, sub }) => (
              <div key={key} className="flex items-center justify-between py-2.5 px-1">
                <div>
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400">{sub}</p>
                </div>
                <Toggle on={alerts[key]} onToggle={() => toggle(setAlerts, key)} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold transition ${saved ? "bg-emerald-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
          {saved ? "✓ Saved" : "Save preferences"}
        </button>
      </div>
    </div>
  );
}
