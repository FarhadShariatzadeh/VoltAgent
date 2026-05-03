import { Bell, TrendingUp, Zap, AlertTriangle } from "lucide-react";

const ALERTS = [
  {
    icon: AlertTriangle,
    color: "text-yellow-600",
    title: "Peak window in 45 min",
    body: "Run laundry before 5 PM to save ~$0.40 today.",
    time: "4:15 PM",
  },
  {
    icon: TrendingUp,
    color: "text-red-600",
    title: "Tier 1 at 68%",
    body: "190 kWh left before the higher tier — pacing is normal.",
    time: "8:00 AM",
  },
  {
    icon: Zap,
    color: "text-blue-600",
    title: "Vampire load detected",
    body: "Unusual baseline draw (62W) between 1–4 AM. Check chargers.",
    time: "Yesterday",
  },
  {
    icon: Bell,
    color: "text-green-600",
    title: "Bill on track",
    body: "Estimated $142 — $18 lower than last month. Keep it up!",
    time: "2 days ago",
  },
];

export function AlertsFeed() {
  return (
    <div className="bg-background border rounded-lg p-5">
      <h3 className="font-semibold mb-4">Agent Alerts</h3>
      <ul className="space-y-4">
        {ALERTS.map((a) => (
          <li key={a.title} className="flex gap-3">
            <a.icon className={`h-4 w-4 mt-0.5 shrink-0 ${a.color}`} />
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.body}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0 ml-auto">
              {a.time}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
