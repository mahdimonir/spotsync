"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThreeCanvas from "@/components/ThreeCanvas";
import { api } from "@/lib/api";
import { UserPlus, Mail, Lock, User, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"driver" | "admin">("driver");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.register({
        name,
        email,
        password,
        role,
      });

      if (response.success) {
        router.push("/login?registered=true");
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err: any) {
      setError(err?.message || "Email address is already in use");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 selection:bg-emerald-600 selection:text-white">
      {/* 3D background */}
      <ThreeCanvas />

      {/* Register Card */}
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white/80 p-8 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.035)]">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-bold text-neutral-900 tracking-tight">
            Spot<span className="text-emerald-600 font-bold">Sync</span>
          </Link>
          <h2 className="text-base font-semibold text-neutral-800 mt-3">Create Account</h2>
          <p className="text-xs text-neutral-500 mt-1">Get instant access to SpotSync reservations</p>
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
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-xs text-neutral-900 placeholder-neutral-400 focus:border-emerald-600 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

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
                placeholder="john.doe@spotsync.com"
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
                placeholder="Min 6 characters"
                className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-xs text-neutral-900 placeholder-neutral-400 focus:border-emerald-600 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Join As
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("driver")}
                className={`py-2.5 rounded-lg border text-xs font-bold transition-all ${
                  role === "driver"
                    ? "bg-neutral-100 border-emerald-600 text-neutral-900 shadow-sm"
                    : "bg-white border-neutral-200 text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Driver
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`py-2.5 rounded-lg border text-xs font-bold transition-all ${
                  role === "admin"
                    ? "bg-neutral-100 border-emerald-600 text-neutral-900 shadow-sm"
                    : "bg-white border-neutral-200 text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Admin
              </button>
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
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
