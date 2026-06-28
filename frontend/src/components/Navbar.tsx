"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Car, User, LogOut } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setUserRole(localStorage.getItem("userRole"));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUserRole(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-neutral-900 font-semibold text-lg tracking-tight group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors group-hover:bg-emerald-500">
            <Car className="h-5 w-5" />
          </div>
          <span>
            Spot<span className="text-emerald-600 font-bold">Sync</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-500 font-medium">
          <a href="#features" className="hover:text-neutral-900 transition-colors">Features</a>
          <a href="#zones" className="hover:text-neutral-900 transition-colors">Parking Zones</a>
          <a href="#statistics" className="hover:text-neutral-900 transition-colors">Stats</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {token ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 hover:border-neutral-400 transition-all"
              >
                <User className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-transparent bg-transparent px-3 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-all px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-all shadow-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
