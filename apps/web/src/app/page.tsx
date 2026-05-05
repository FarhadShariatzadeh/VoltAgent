import Link from "next/link";
import { SavingsCalculator } from "@/components/calculator/SavingsCalculator";
import { Zap, Bell, TrendingDown, Shield, BarChart3, Target, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  {
    icon: TrendingDown,
    color: "bg-blue-50 text-blue-600",
    title: "Bill Forecasting",
    description: "AI predicts your end-of-month bill in real time and alerts you before you overspend.",
  },
  {
    icon: Bell,
    color: "bg-amber-50 text-amber-600",
    title: "Time-of-Use Alerts",
    description: "Get notified before peak pricing windows so you can shift loads and save instantly.",
  },
  {
    icon: BarChart3,
    color: "bg-violet-50 text-violet-600",
    title: "Tier Tracker",
    description: "See exactly how many kWh remain before you cross into the more expensive tier.",
  },
  {
    icon: Shield,
    color: "bg-emerald-50 text-emerald-600",
    title: "Vampire Audit",
    description: "Identify always-on devices draining power overnight and see the exact dollar cost.",
  },
];

const stats = [
  { value: "$24", label: "avg. monthly savings" },
  { value: "2,400+", label: "active users" },
  { value: "1.2M", label: "kWh shifted off-peak" },
  { value: "5 min", label: "to get started" },
];

const trustedBy = ["Puget Sound Energy", "Seattle City Light", "Tacoma Power", "Snohomish PUD"];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            VoltAgent
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition">
              Sign in
            </Link>
            <Link href="/auth/signup" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pt-20 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Built for Washington state homeowners
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Your AI energy agent,
            <span className="text-blue-600"> working 24/7</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            VoltAgent connects to your utility account, forecasts your bill, and sends smart alerts
            before you waste money — all automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              Start saving — it's free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#calculator" className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-slate-50 transition">
              Calculate my savings
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {trustedBy.map((u) => (
              <span key={u} className="text-sm text-slate-400 font-medium">{u}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Everything your utility won't tell you
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Four AI agents run around the clock, each specialized in a different way to cut your bill.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Up and running in 5 minutes</h2>
            <p className="text-slate-500">No hardware, no electrician, no hassle.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Connect your utility", body: "Link your account via Green Button OAuth. Read-only access — we never touch your billing." },
              { step: "2", title: "Your agent goes to work", body: "VoltAgent analyzes 15-minute interval data every 15 minutes and builds your personal baseline." },
              { step: "3", title: "Receive smart alerts", body: "Get email or SMS alerts before peak windows, tier crossings, and vampire loads appear." },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="max-w-2xl mx-auto px-6 py-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">How much could you save?</h2>
          <p className="text-slate-500">Adjust the sliders and see your estimated monthly savings instantly.</p>
        </div>
        <SavingsCalculator />
      </section>

      {/* Trust */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <Shield className="h-12 w-12 mx-auto mb-5 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Your data is yours</h2>
          <p className="text-blue-100 max-w-xl mx-auto leading-relaxed mb-8">
            Green Button OAuth gives us read-only access. Your utility credentials are never stored.
            All data is encrypted at rest and in transit, and never sold or shared.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["Read-only utility access", "AES-256 encryption", "Never sold", "SOC 2 providers"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-sm text-blue-100">
                <CheckCircle className="h-4 w-4 text-blue-300" />
                {t}
              </div>
            ))}
          </div>
          <Link href="/privacy" className="inline-flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 transition text-white px-5 py-2.5 rounded-lg font-medium">
            Read our Privacy & Security policy
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Ready to stop overpaying?</h2>
        <p className="text-slate-500 mb-8">Free forever. No credit card. Takes 5 minutes.</p>
        <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
          Create your free account
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            VoltAgent
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} VoltAgent. Built for Washington state residents.</p>
          <div className="flex gap-5 text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-slate-700 transition">Privacy</Link>
            <Link href="/auth/login" className="hover:text-slate-700 transition">Sign in</Link>
            <Link href="/auth/signup" className="hover:text-slate-700 transition">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
