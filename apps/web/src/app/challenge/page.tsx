"use client";

import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { challengeApi, type ChallengeData, type ChallengeDayResult } from "@/lib/api";
import { Zap, Target, Trophy, Calendar, TrendingDown, Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";

function ProgressRing({ pct }: { pct: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={120} height={120} viewBox="0 0 120 120" className="-rotate-90">
      <circle cx={60} cy={60} r={r} fill="none" stroke="#f1f5f9" strokeWidth={10} />
      <circle cx={60} cy={60} r={r} fill="none" stroke="#2563eb" strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
}

export default function ChallengePage() {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [days, setDays] = useState<ChallengeDayResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [c, d] = await Promise.all([challengeApi.getCurrent(), challengeApi.getDayResults()]);
      setChallenge(c);
      setDays(d);
    } catch { setChallenge(null); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleEnroll() {
    setEnrolling(true);
    setError(null);
    try { await challengeApi.enroll(); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Enrollment failed"); }
    finally { setEnrolling(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">30-Day Energy Sprint</h1>
            <p className="text-sm text-slate-400">Challenge yourself to cut usage by 10% for 30 days.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
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

function EnrollCard({ onEnroll, enrolling, error }: { onEnroll: () => void; enrolling: boolean; error: string | null }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* CTA card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 flex flex-col">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
          <Zap className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Start Your Sprint</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
          VoltAgent sets a personalized 10% reduction target based on your last 30 days and tracks your daily progress automatically.
        </p>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
        )}
        <button
          onClick={onEnroll}
          disabled={enrolling}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-60"
        >
          {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {enrolling ? "Enrolling…" : "Start 30-Day Sprint"}
        </button>
      </div>

      {/* Benefits */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white flex flex-col justify-between">
        <h3 className="font-bold text-lg mb-5">What you get</h3>
        <ul className="space-y-4 flex-1">
          {[
            "Baseline auto-computed from your usage history",
            "Daily results tracked — no manual entry needed",
            "Progress bar and dollar savings updated nightly",
            "Weekly email summary with AI tips from your agent",
          ].map((t) => (
            <li key={t} className="flex items-start gap-3 text-sm text-blue-100">
              <CheckCircle className="h-4 w-4 text-blue-300 shrink-0 mt-0.5" />
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-6 bg-white/10 rounded-xl p-4">
          <p className="text-blue-100 text-xs mb-1">Average sprint winner saves</p>
          <p className="text-3xl font-extrabold">$47</p>
        </div>
      </div>
    </div>
  );
}

function ActiveChallenge({ challenge, days }: { challenge: ChallengeData; days: ChallengeDayResult[] }) {
  const pct = challenge.progress_pct;

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Progress ring */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col items-center justify-center text-center">
          <div className="relative inline-flex items-center justify-center mb-2">
            <ProgressRing pct={pct} />
            <div className="absolute text-center">
              <p className="text-2xl font-extrabold text-slate-900">{challenge.days_elapsed}</p>
              <p className="text-xs text-slate-400">/ 30 days</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-700">Sprint Progress</p>
          <p className="text-xs text-slate-400 mt-0.5">{challenge.days_remaining} days left</p>
        </div>

        {/* Savings */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">${challenge.dollars_saved_total.toFixed(2)}</p>
          <p className="text-sm text-slate-500 mt-1">Saved so far</p>
          <p className="text-xs text-slate-400">{challenge.kwh_saved_total.toFixed(1)} kWh reduced</p>
        </div>

        {/* Days on target */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
            <TrendingDown className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {challenge.days_on_target}
            <span className="text-lg font-normal text-slate-400">/{challenge.days_elapsed}</span>
          </p>
          <p className="text-sm text-slate-500 mt-1">Days on target</p>
          <p className="text-xs text-slate-400">Goal ≤ {challenge.target_daily_kwh.toFixed(1)} kWh/day</p>
        </div>
      </div>

      {/* Target banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center gap-3">
        <Zap className="h-5 w-5 text-blue-600 shrink-0" />
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Daily target: {challenge.target_daily_kwh.toFixed(1)} kWh</span>
          {" "}— that's 10% below your baseline of {challenge.baseline_daily_kwh.toFixed(1)} kWh/day.
        </p>
      </div>

      {/* Day results */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <h3 className="font-semibold text-slate-800 text-sm">Daily Results</h3>
        </div>
        {days.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-400">
            Results appear here after midnight UTC each night.
          </div>
        ) : (
          <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {[...days].reverse().map((d) => (
              <div key={d.day_number} className="flex items-center gap-4 px-6 py-3">
                {d.met_target
                  ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  : <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                <span className="text-xs text-slate-400 w-14 shrink-0">Day {d.day_number + 1}</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${d.met_target ? "bg-emerald-400" : "bg-red-400"}`}
                    style={{ width: `${Math.min((d.actual_kwh / (d.target_kwh * 1.5)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 w-18 text-right shrink-0">{d.actual_kwh.toFixed(1)} kWh</span>
                {d.met_target && (
                  <span className="text-xs font-semibold text-emerald-600 w-14 text-right shrink-0">+${d.dollars_saved.toFixed(2)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
