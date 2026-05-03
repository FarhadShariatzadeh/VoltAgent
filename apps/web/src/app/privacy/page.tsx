import { Shield, Lock, Eye, Server, Key, Mail, Trash2 } from "lucide-react";
import Link from "next/link";

const SECTIONS = [
  {
    icon: Lock,
    title: "Data Encryption",
    body: "All data in transit is encrypted with TLS 1.3. Passwords are never stored — we store only a bcrypt hash (cost factor 12). Your utility OAuth tokens are encrypted at rest using AES-256 before being written to the database.",
  },
  {
    icon: Eye,
    title: "What We Collect",
    body: "We collect the energy usage data you authorize through your utility's Green Button Connect API or PDF bill uploads. We collect your email and optional phone number for notifications. We do not collect payment information, SSNs, or any financial account numbers.",
  },
  {
    icon: Server,
    title: "Where Your Data Lives",
    body: "Your data is stored in a PostgreSQL database hosted in US-West (Seattle region). It is never sold to third parties or shared with advertisers. Aggregate, de-identified statistics may be used for platform analytics shown to investors.",
  },
  {
    icon: Key,
    title: "Utility OAuth Transparency",
    body: "When you connect your utility account via Green Button Connect, we request read-only access to your usage data (scope: FB=4,5,15). We do not request the ability to modify your account, change rates, or make payments. You can revoke access at any time from your utility's website or from the Settings page.",
  },
  {
    icon: Shield,
    title: "AI Agent Access",
    body: "The VoltAgent AI only reads your usage data to generate forecasts and recommendations. It does not have the ability to control appliances, change settings, or take actions outside of generating text alerts and summaries. All AI-generated recommendations are advisory.",
  },
  {
    icon: Mail,
    title: "Notifications",
    body: "Email and SMS notifications are opt-in per alert type. You can disable all notifications or fine-tune which alerts you receive from the Settings page. We use Resend for email delivery and Twilio for SMS — both are SOC 2 certified providers.",
  },
  {
    icon: Trash2,
    title: "Data Deletion",
    body: "You can request complete deletion of your account and all associated data by emailing privacy@voltagent.app. Deletion is processed within 30 days. Backups containing your data are purged within 90 days of the deletion request.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl font-bold mb-3">Privacy & Security</h1>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            VoltAgent handles your energy data with the same care your utility does.
            Here is exactly what we collect, how we protect it, and how you stay in control.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {SECTIONS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-5">
            <div className="shrink-0 mt-0.5">
              <div className="bg-primary/10 rounded-lg p-2.5">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1.5">{title}</h2>
              <p className="text-muted-foreground leading-relaxed">{body}</p>
            </div>
          </div>
        ))}

        {/* Contact */}
        <div className="border-t pt-8 text-center">
          <p className="text-muted-foreground">
            Questions about your data?{" "}
            <a
              href="mailto:privacy@voltagent.app"
              className="text-primary hover:underline font-medium"
            >
              privacy@voltagent.app
            </a>
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition">
              Home
            </Link>
            <Link href="/settings" className="text-muted-foreground hover:text-foreground transition">
              Settings
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition">
              Dashboard
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Last updated: May 2026 &mdash; VoltAgent, Inc. &mdash; Seattle, WA
          </p>
        </div>
      </div>
    </div>
  );
}
