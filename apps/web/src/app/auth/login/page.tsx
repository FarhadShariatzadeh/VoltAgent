"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await apiClient.post<{ access_token: string }>("/auth/login", data);
      localStorage.setItem("access_token", res.access_token);
      window.location.href = "/dashboard";
    } catch {
      setError("root", { message: "Invalid email or password." });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Zap className="h-6 w-6" />
          VoltAgent
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Welcome back. Your energy agent has been busy.
          </h2>
          <p className="text-blue-100 text-lg">
            Check your forecasts, review alerts, and track your 30-day sprint progress.
          </p>
        </div>
        <div className="bg-white/10 rounded-xl p-6">
          <p className="text-blue-100 text-sm mb-1">Average user sees</p>
          <p className="text-5xl font-bold">$24<span className="text-2xl font-normal text-blue-200">/mo saved</span></p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 font-bold text-xl text-blue-600 mb-8">
            <Zap className="h-5 w-5" />
            VoltAgent
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-1">Sign in</h1>
          <p className="text-slate-500 mb-8">Access your energy dashboard</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="jane@example.com"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                {...register("password")}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
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
              {isSubmitting ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-600 font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
