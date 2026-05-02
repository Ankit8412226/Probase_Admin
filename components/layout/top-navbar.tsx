"use client";

import { Bell, LogOut, Search, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function TopNavbar() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  async function handleLogout() {
    if (isDemoMode) {
      router.refresh();
      return;
    }

    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-line bg-white/85 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3 rounded-[16px] border border-line bg-mist px-4 py-3">
        <Search size={16} className="text-fog" />
        <span className="text-sm text-fog">Search employees, projects, leads...</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="subtle-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-fog transition hover:bg-mist hover:text-black"
        >
          <Bell size={16} />
        </button>
        <div className="flex items-center gap-3 rounded-full border border-line bg-white px-3 py-2 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
            {user?.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-fog">
              <ShieldCheck size={12} />
              {isDemoMode ? "demo admin" : user?.role}
            </p>
          </div>
          {isDemoMode ? (
            <span className="rounded-full border border-line bg-mist px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-fog">
              Demo Mode
            </span>
          ) : (
            <Button variant="ghost" className="h-9 px-3" onClick={handleLogout}>
              <LogOut size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
