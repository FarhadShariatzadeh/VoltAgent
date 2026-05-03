"use client";

export function TierTrackerCard() {
  const usedKwh = 410;
  const tierLimit = 600;
  const pct = Math.min((usedKwh / tierLimit) * 100, 100);
  const remaining = tierLimit - usedKwh;

  return (
    <div className="bg-background border rounded-lg p-5">
      <p className="text-sm text-muted-foreground mb-1">Tier Usage</p>
      <p className="text-3xl font-bold">
        {usedKwh}{" "}
        <span className="text-base font-normal text-muted-foreground">
          / {tierLimit} kWh
        </span>
      </p>

      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct > 85 ? "bg-red-500" : pct > 65 ? "bg-yellow-500" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        {remaining} kWh left in Tier 1 — next tier costs ~42% more.
      </p>
    </div>
  );
}
