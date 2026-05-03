"use client";

import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { challengeApi, type ChallengeData, type ChallengeDayResult } from "@/lib/api";
import { Zap, Target, Trophy, Calendar, TrendingDown, Loader2, CheckCircle, XCircle } from "lucide-react";

function ProgressRing({ pct }: { pct: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <svg width={128} height={128} viewBox="0 0 128 128" className="rotate-[-90deg]">
      <circle cx={64} cy={64} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={12} />
      <circle
        cx={64}
        cy={64}
        r={r}
        fill="none"
        stroke="hsl(221.2,83.2%,53.3%)"
        strokeWidth={12}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

export default function ChallengePage() {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [days, setDays] = useState<ChallengeDayResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadChallenge() {
    try {
      const [c, d] = await Promise.all([
        challengeApi.getCurrent(),
        challengeApi.getDayResults(),
      ]);
      setChallenge(c);
      setDays(d);
    } catch {
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadChallenge(); }, []);

  async function handleEnroll() {
    setEnrolling(true);
    setError(null);
    try {
      await challengeApi.enroll();
      await loadChallenge();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Target className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">30-Day Energy Sprint</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !challenge ? (
          <EnrollCard onEnroll={handleEnroll} enrolling={enrolling} error={error} />
        ) : (
          <ActiveChallenge challenge={challenge} days={days} />
        )}
      </main>
    </div>
  );
}

function EnrollCard({
  onEnroll,
  enrolling,
  error,
}: {
  onEnroll: () => void;
  enrolling: boolean;
  error: string | null;
}) {
  return (
    <div className="bg-background border rounded-xl p-8 max-w-lg mx-auto text-center space-y-6">
      <div className="flex justify-center">
        <div className="bg-primary/10 rounded-full p-4">
          <Zap className="h-10 w-10 text-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Start Your 30-Day Sprint</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Challenge yourself to cut energy use by <strong>10%</strong> for 30 days.
          VoltAgent tracks your daily progress and coaches you with personalized tips.
        </p>
      </div>

      <ul className="text-sm text-left space-y-2 text-muted-foreground">
        <li className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
          Baseline computed from your last 30 days of usage
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
          Daily results tracked automatically — no manual entry
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
          Weekly email summary with progress and tips from your AI agent
        </li>
      </ul>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
      )}

      <button
        onClick={onEnroll}
        disabled={enrolling}
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
        {enrolling ? "Enrolling…" : "Start Sprint"}
      </button>
    </div>
  );
}

function ActiveChallenge({
  challenge,
  days,
}: {
  challenge: ChallengeData;
  days: ChallengeDayResult[];
}) {
  const totalSaved = challenge.dollars_saved_total;
  const daysOn = challenge.days_on_target;
  const daysElapsed = challenge.days_elapsed;

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-background border rounded-lg p-5 text-center">
          <div className="flex justify-center mb-2">
            <div className="relative inline-flex items-center justify-center">
              <ProgressRing pct={challenge.progress_pct} />
              <div className="absolute text-center">
                <p className="text-2xl font-bold">{challenge.days_elapsed}</p>
                <p className="text-xs text-muted-foreground">/ 30 days</p>
              </div>
            </div>
          </div>
          <p className="text-sm font-medium">Sprint Progress</p>
          <p className="text-xs text-muted-foreground">{challenge.days_remaining} days remaining</p>
        </div>

        <div className="bg-background border rounded-lg p-5 flex flex-col items-center justify-center text-center">
          <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
          <p className="text-3xl font-bold">${totalSaved.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-1">Saved so far</p>
          <p className="text-xs text-muted-foreground">{challenge.kwh_saved_total.toFixed(1)} kWh reduced</p>
        </div>

        <div className="bg-background border rounded-lg p-5 flex flex-col items-center justify-center text-center">
          <TrendingDown className="h-8 w-8 text-green-500 mb-2" />
          <p className="text-3xl font-bold">{daysOn}<span className="text-lg font-normal text-muted-foreground">/{daysElapsed}</span></p>
          <p className="text-sm text-muted-foreground mt-1">Days on target</p>
          <p className="text-xs text-muted-foreground">Goal: ≤ {challenge.target_daily_kwh.toFixed(1)} kWh/day</p>
        </div>
      </div>

      {/* Target info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Zap className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <span className="font-semibold">Your daily target: {challenge.target_daily_kwh.toFixed(1)} kWh</span>
          {" "}(10% below your baseline of {challenge.baseline_daily_kwh.toFixed(1)} kWh/day)
        </div>
      </div>

      {/* Daily results */}
      {days.length > 0 && (
        <div className="bg-background border rounded-lg p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Daily Results
          </h3>
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {[...days].reverse().map((d) => (
              <div
                key={d.day_number}
                className="flex items-center gap-3 py-2 border-b last:border-0"
              >
                {d.met_target ? (
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <span className="text-sm text-muted-foreground w-20 shrink-0">
                  Day {d.day_number + 1}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${d.met_target ? "bg-green-500" : "bg-red-400"}`}
                    style={{
                      width: `${Math.min((d.actual_kwh / (d.target_kwh * 1.5)) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm w-20 text-right">
                  {d.actual_kwh.toFixed(1)} kWh
                </span>
                {d.met_target && (
                  <span className="text-xs text-green-600 w-16 text-right">
                    +${d.dollars_saved.toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {days.length === 0 && (
        <div className="bg-background border rounded-lg p-5 text-center text-sm text-muted-foreground py-8">
          Day results appear here after midnight UTC each night. Check back tomorrow!
        </div>
      )}
    </div>
  );
}
