"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap } from "lucide-react";
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
      await apiClient.post("/auth/register", data);
      window.location.href = "/dashboard";
    } catch {
      setError("root", { message: "Could not create account. Try again." });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm bg-background border rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl mb-8">
          <Zap className="text-primary h-5 w-5" />
          VoltAgent
        </div>

        <h1 className="text-2xl font-bold mb-1">Start saving today</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Create your free account — no credit card required
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              {...register("full_name")}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.full_name && (
              <p className="text-destructive text-xs mt-1">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.email && (
              <p className="text-destructive text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone{" "}
              <span className="text-muted-foreground font-normal">
                (optional — for SMS alerts)
              </span>
            </label>
            <input
              {...register("phone")}
              type="tel"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              {...register("password")}
              type="password"
              autoComplete="new-password"
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
            {isSubmitting ? "Creating account…" : "Create free account"}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            By signing up you agree to our Terms and Privacy Policy.
          </p>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
