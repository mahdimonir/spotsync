"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThreeCanvas from "@/components/ThreeCanvas";
import { api } from "@/lib/api";
import { Lock, Mail, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.login({ email, password });
      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", response.data.user.role);
        localStorage.setItem("userName", response.data.user.name);
        localStorage.setItem("userEmail", response.data.user.email);
        localStorage.setItem("userID", String(response.data.user.id));

        router.push("/dashboard");
        router.refresh();
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 selection:bg-emerald-600 selection:text-white">
      {/* 3D background */}
      <ThreeCanvas />

      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white/80 p-8 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.035)]">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-bold text-neutral-900 tracking-tight">
            Spot<span className="text-emerald-600 font-bold">Sync</span>
          </Link>
          <h2 className="text-base font-semibold text-neutral-800 mt-3">Welcome Back</h2>
          <p className="text-xs text-neutral-500 mt-1">Sign in to book parking zones & EV spots</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 p-3.5 text-xs text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@spotsync.com"
                className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-xs text-neutral-900 placeholder-neutral-400 focus:border-emerald-600 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-xs text-neutral-900 placeholder-neutral-400 focus:border-emerald-600 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-xs font-semibold text-white hover:bg-emerald-500 focus:outline-none disabled:opacity-50 transition-all shadow-sm"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-neutral-500">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-500">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
