import { Clock } from "lucide-react";

const PERIOD_COLORS: Record<string, string> = {
  peak: "text-red-600 bg-red-50",
  "off-peak": "text-green-600 bg-green-50",
  "super-off-peak": "text-blue-600 bg-blue-50",
};

export function TOUStatusCard() {
  const currentPeriod = "off-peak";
  const nextPeriodStart = "5:00 PM";

  return (
    <div className="bg-background border rounded-lg p-5">
      <p className="text-sm text-muted-foreground mb-1">Current Rate</p>
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium capitalize mt-1 ${PERIOD_COLORS[currentPeriod]}`}
      >
        <Clock className="h-3.5 w-3.5" />
        {currentPeriod}
      </div>
      <p className="text-sm mt-3">
        <span className="font-medium">$0.089/kWh</span> right now
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Peak starts at {nextPeriodStart} — run heavy appliances before then.
      </p>
    </div>
  );
}
