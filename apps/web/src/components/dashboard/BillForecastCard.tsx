import { TrendingUp, TrendingDown } from "lucide-react";

export function BillForecastCard() {
  return (
    <div className="bg-background border rounded-lg p-5">
      <p className="text-sm text-muted-foreground mb-1">Forecasted Bill</p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold">$142</span>
        <span className="text-muted-foreground text-sm mb-0.5">this month</span>
      </div>
      <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
        <TrendingDown className="h-4 w-4" />
        <span>$18 below last month</span>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Based on your current usage pace. Updated every 15 min.
      </p>
    </div>
  );
}
