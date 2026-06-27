"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, LayoutDashboard, LogOut, User, Menu, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");

    if (!token || !role) {
      localStorage.clear();
      router.push("/login");
    } else {
      setUser({ name: name || "", email: email || "", role: role || "driver" });
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] text-[#0a0a0a]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span className="text-xs text-neutral-500 font-medium">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] text-[#0a0a0a] font-sans overflow-x-hidden">
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/15 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#ebebeb] flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#ebebeb]">
          <Link href="/" className="flex items-center gap-2 text-neutral-900 font-semibold text-base tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Car className="h-4 w-4" />
            </div>
            <span>
              Spot<span className="text-emerald-600 font-bold">Sync</span>
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Sidebar links */}
        <nav className="flex-1 py-6 px-4 space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest px-3 mb-2">
            Main Menu
          </div>
          
          <Link
            href="/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100 transition-all"
          >
            <LayoutDashboard className="h-4 w-4 text-[#059669]" />
            <span>Dashboard</span>
          </Link>
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#ebebeb] bg-neutral-50/50">
          <div className="flex items-center gap-3 px-2 py-1.5 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-[#ebebeb] text-neutral-600 shadow-xs">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-neutral-900 truncate">{user?.name}</div>
              <div className="text-[10px] text-neutral-500 capitalize flex items-center gap-1 mt-0.5 font-medium">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${user?.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'}`} />
                <span>{user?.role}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header toolbar */}
        <header className="h-16 border-b border-[#ebebeb] flex items-center justify-between px-6 lg:px-8 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xs font-bold text-neutral-800 uppercase tracking-widest">Console Workspace</h1>
          </div>
          <div className="text-xs text-neutral-500 font-medium">
            System Status: <span className="text-emerald-600 font-semibold">Active</span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>

    </div>
  );
}
