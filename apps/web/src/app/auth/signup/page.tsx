"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await apiClient.post<{ access_token: string }>("/auth/register", data);
      localStorage.setItem("access_token", res.access_token);
      window.location.href = "/dashboard";
    } catch (e) {
      setError("root", {
        message: e instanceof Error ? e.message : "Could not create account. Try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Zap className="h-6 w-6" />
          VoltAgent
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Save up to $300/year on your electricity bill
          </h2>
          <p className="text-blue-100 text-lg">
            AI-powered energy management for Washington state homeowners. Free forever.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Avg. monthly savings", value: "$24" },
            { label: "Active users", value: "2,400+" },
            { label: "kWh shifted to off-peak", value: "1.2M" },
            { label: "Setup time", value: "5 min" },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-blue-100 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 font-bold text-xl text-blue-600 mb-8">
            <Zap className="h-5 w-5" />
            VoltAgent
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 mb-8">No credit card required · Free forever</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
              <input
                {...register("full_name")}
                placeholder="Jane Smith"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="jane@example.com"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone <span className="text-slate-400 font-normal">(optional — for SMS alerts)</span>
              </label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+1 (206) 555-0100"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                {...register("password")}
                type="password"
                placeholder="8+ characters"
                autoComplete="new-password"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
                {errors.root.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating account…" : "Create free account →"}
            </button>

            <p className="text-xs text-slate-400 text-center">
              By signing up you agree to our{" "}
              <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
            </p>
          </form>

          <p className="text-sm text-center text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
