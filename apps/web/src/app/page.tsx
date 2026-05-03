import Link from "next/link";
import { SavingsCalculator } from "@/components/calculator/SavingsCalculator";
import { Zap, Bell, TrendingDown, Shield } from "lucide-react";

const features = [
  {
    icon: TrendingDown,
    title: "Bill Forecasting",
    description:
      "AI predicts your end-of-month electricity bill in real time and alerts you before you overspend.",
  },
  {
    icon: Bell,
    title: "Time-of-Use Alerts",
    description:
      "Get notified before peak pricing windows and receive the best times to run heavy appliances.",
  },
  {
    icon: Zap,
    title: "Tier Threshold Tracker",
    description:
      "Know exactly how many kWh you have left before jumping into a more expensive rate tier.",
  },
  {
    icon: Shield,
    title: "Vampire Power Audit",
    description:
      "Identify always-on devices silently draining energy and see the exact monthly dollar cost.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Zap className="text-primary h-5 w-5" />
          VoltAgent
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Your AI energy manager,
          <br />
          <span className="text-primary">working 24/7</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          VoltAgent connects to your Washington utility account, forecasts your
          bill, and sends you smart alerts via email or text — before you waste
          money.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md text-base font-medium hover:opacity-90 transition-opacity"
          >
            Start saving — it's free
          </Link>
          <a
            href="#calculator"
            className="border px-6 py-3 rounded-md text-base font-medium hover:bg-muted transition-colors"
          >
            See my potential savings
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything your utility company won't tell you
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-6 border rounded-lg">
              <f.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Savings Calculator */}
      <section id="calculator" className="max-w-2xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          How much could you save?
        </h2>
        <p className="text-center text-muted-foreground mb-10">
          Enter a few details and VoltAgent estimates your monthly savings.
        </p>
        <SavingsCalculator />
      </section>

      {/* Trust */}
      <section className="bg-muted py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your data stays private</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We connect using the industry-standard Green Button protocol and
            OAuth. Your utility credentials are never stored. Data is encrypted
            at rest and in transit and never sold or shared.
          </p>
          <Link
            href="/privacy"
            className="inline-block mt-4 text-primary text-sm font-medium hover:underline"
          >
            Read our full Privacy & Security policy →
          </Link>
        </div>
      </section>

      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground space-y-2">
        <p>© {new Date().getFullYear()} VoltAgent. Built for Washington state residents.</p>
        <div className="flex justify-center gap-6">
          <Link href="/privacy" className="hover:text-foreground transition">Privacy & Security</Link>
          <Link href="/auth/login" className="hover:text-foreground transition">Sign In</Link>
          <Link href="/auth/signup" className="hover:text-foreground transition">Get Started</Link>
        </div>
      </footer>
    </main>
  );
}
