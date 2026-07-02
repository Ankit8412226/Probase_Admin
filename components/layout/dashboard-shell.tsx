"use client";

import { useState, useEffect } from "react";

import { AuthProvider } from "@/context/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import type { AuthUser } from "@/types";

export function DashboardShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("dashboard-theme");
    return () => {
      document.body.classList.remove("dashboard-theme");
    };
  }, []);

  return (
    <AuthProvider initialUser={user}>
      <div className="dashboard-theme grid min-h-screen bg-white lg:grid-cols-[auto_1fr]">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggle={() => setCollapsed((current) => !current)}
          onMobileToggle={() => setMobileOpen((current) => !current)}
        />
        <div className="min-w-0">
          <TopNavbar />
          <main className="flex w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
