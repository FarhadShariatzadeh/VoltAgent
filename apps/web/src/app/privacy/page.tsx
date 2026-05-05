import { Shield, Lock, Eye, Server, Key, Mail, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";

const SECTIONS = [
  {
    icon: Lock,
    color: "bg-blue-50 text-blue-600",
    title: "Data Encryption",
    body: "All data in transit is encrypted with TLS 1.3. Passwords are never stored — we keep only a bcrypt hash (cost factor 12). Utility OAuth tokens are encrypted at rest using AES-256 before being written to the database.",
  },
  {
    icon: Eye,
    color: "bg-violet-50 text-violet-600",
    title: "What We Collect",
    body: "We collect the energy usage data you authorize through your utility's Green Button Connect API or PDF bill uploads. We collect your email and optional phone number for notifications. We do not collect payment information, SSNs, or any financial account numbers.",
  },
  {
    icon: Server,
    color: "bg-slate-50 text-slate-600",
    title: "Where Your Data Lives",
    body: "Your data is stored in a PostgreSQL database hosted in the US-West (Seattle region). It is never sold to third parties or shared with advertisers. Aggregate, de-identified statistics may be used for platform analytics shown to investors.",
  },
  {
    icon: Key,
    color: "bg-amber-50 text-amber-600",
    title: "Utility OAuth Transparency",
    body: "When you connect via Green Button Connect, we request read-only access (scope: FB=4,5,15). We cannot modify your account, change rates, or make payments. You can revoke access at any time from your utility's website or from Settings.",
  },
  {
    icon: Shield,
    color: "bg-emerald-50 text-emerald-600",
    title: "AI Agent Access",
    body: "The VoltAgent AI only reads your usage data to generate forecasts and recommendations. It has no ability to control appliances, change settings, or take actions outside of generating text alerts. All recommendations are advisory.",
  },
  {
    icon: Mail,
    color: "bg-rose-50 text-rose-600",
    title: "Notifications",
    body: "Email and SMS notifications are opt-in per alert type. You can disable all notifications or fine-tune which alerts you receive from Settings. We use Resend for email and Twilio for SMS — both SOC 2 certified.",
  },
  {
    icon: Trash2,
    color: "bg-red-50 text-red-600",
    title: "Data Deletion",
    body: "You can request complete deletion of your account and all associated data by emailing privacy@voltagent.app. Deletion is processed within 30 days. Backups are purged within 90 days of the request.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            VoltAgent
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800 transition flex items-center gap-1">
            Go to dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-50 to-white py-16 px-6 border-b border-slate-100">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Privacy & Security</h1>
          <p className="text-slate-500 leading-relaxed">
            VoltAgent handles your energy data with the same care your utility does.
            Here's exactly what we collect, how we protect it, and how you stay in control.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
        {SECTIONS.map(({ icon: Icon, color, title, body }) => (
          <div key={title} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex gap-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 mb-1.5">{title}</h2>
              <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 bg-slate-50 py-10 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-slate-600 text-sm">
            Questions about your data?{" "}
            <a href="mailto:privacy@voltagent.app" className="text-blue-600 font-medium hover:underline">
              privacy@voltagent.app
            </a>
          </p>
          <div className="flex justify-center gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-slate-700 transition">Home</Link>
            <Link href="/settings" className="hover:text-slate-700 transition">Settings</Link>
            <Link href="/dashboard" className="hover:text-slate-700 transition">Dashboard</Link>
          </div>
          <p className="text-xs text-slate-400">
            Last updated: May 2026 · VoltAgent, Inc. · Seattle, WA
          </p>
        </div>
      </div>
    </div>
  );
}
