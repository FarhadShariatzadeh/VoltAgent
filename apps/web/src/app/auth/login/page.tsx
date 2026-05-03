"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap } from "lucide-react";
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
      await apiClient.post("/auth/login", data);
      window.location.href = "/dashboard";
    } catch {
      setError("root", { message: "Invalid email or password" });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm bg-background border rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl mb-8">
          <Zap className="text-primary h-5 w-5" />
          VoltAgent
        </div>

        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Sign in to your energy dashboard
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.email && (
              <p className="text-destructive text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.password && (
              <p className="text-destructive text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p className="text-destructive text-sm">{errors.root.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  );
}
