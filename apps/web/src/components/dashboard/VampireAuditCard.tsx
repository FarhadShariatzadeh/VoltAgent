import { Zap } from "lucide-react";

export function VampireAuditCard() {
  return (
    <div className="bg-background border rounded-lg p-5">
      <p className="text-sm text-muted-foreground mb-1">Vampire Power</p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold">$9.40</span>
        <span className="text-muted-foreground text-sm mb-0.5">/month</span>
      </div>
      <div className="flex items-center gap-1 mt-2 text-sm text-yellow-600">
        <Zap className="h-4 w-4" />
        <span>3 devices flagged</span>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Standby power detected during quiet hours (midnight–6 AM).
      </p>
    </div>
  );
}
