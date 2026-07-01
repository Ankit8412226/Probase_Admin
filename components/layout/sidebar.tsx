"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  DollarSign,
  FileText,
  LayoutDashboard,
  Menu,
  ReceiptText,
  Target,
  TrendingUp,
  Users,
  UserRoundSearch,
  Clock,
  Calendar,
  MessageSquare,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  User
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navSections = [
  {
    title: "General",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard, allowedRoles: ["admin", "manager", "business", "employee"] },
      { href: "/dashboard/business", label: "Business", icon: TrendingUp, allowedRoles: ["admin"] },
    ]
  },
  {
    title: "Sales Workflow",
    items: [
      { href: "/dashboard/leads", label: "Leads", icon: UserRoundSearch, allowedRoles: ["admin", "manager", "business", "employee"] },
      { href: "/dashboard/clients", label: "Clients", icon: Building2, allowedRoles: ["admin", "manager", "business", "employee"] },
      { href: "/dashboard/proposals", label: "Proposals", icon: FileText, allowedRoles: ["admin", "manager", "business", "employee"] },
      { href: "/dashboard/invoices", label: "Invoices", icon: ReceiptText, allowedRoles: ["admin", "manager", "business", "employee"] },
      { href: "/dashboard/knowledge", label: "Playbooks", icon: BookOpen, allowedRoles: ["admin", "manager", "business", "employee"] },
    ]
  },
  {
    title: "Team Operations",
    items: [
      { href: "/dashboard/employees", label: "Employees", icon: Users, allowedRoles: ["admin", "manager"] },
      { href: "/dashboard/attendance", label: "Attendance", icon: Clock, allowedRoles: ["admin", "manager"] },
      { href: "/dashboard/shifts", label: "Shifts", icon: Calendar, allowedRoles: ["admin", "manager"] },
      { href: "/dashboard/salaries", label: "Salaries", icon: DollarSign, allowedRoles: ["admin", "manager"] },
    ]
  },
  {
    title: "Settings",
    items: [
      { href: "/dashboard/whatsapp", label: "WhatsApp", icon: MessageSquare, allowedRoles: ["admin", "manager"] },
      { href: "/dashboard/targets", label: "Targets", icon: Target, allowedRoles: ["admin", "manager"] },
      { href: "/dashboard/reports", label: "Reports", icon: BarChart3, allowedRoles: ["admin", "manager"] },
    ]
  }
];

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggle,
  onMobileToggle,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileToggle: () => void;
}) {
  const pathname = usePathname();
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

  // Get active role colors for the pill badge
  const getRoleBadgeTone = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-50 text-purple-700 border-purple-100";
      case "manager": return "bg-amber-50 text-amber-700 border-amber-100";
      case "business": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onMobileToggle}
        className="subtle-ring fixed left-4 top-4 z-50 rounded-full border border-line bg-white p-3 shadow-card lg:hidden"
      >
        <Menu size={18} />
      </button>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onMobileToggle}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-line bg-[#0c0f12]/98 text-white/90 px-4 py-6 shadow-xl backdrop-blur-md lg:sticky lg:top-0 lg:z-20 transition-all duration-300",
          collapsed ? "w-[84px]" : "w-[270px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Branding header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-5 px-1.5">
          <div className={cn("flex items-center gap-2.5 overflow-hidden transition-all duration-200", collapsed && "w-0 opacity-0")}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-bold shadow-md shadow-emerald-500/10">
              P
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-white/40 leading-none">
                Probase Solutions
              </p>
              <p className="mt-1 text-sm font-semibold tracking-tight text-white leading-none">
                {user?.role === "employee" ? "Employee Portal" : user?.role === "business" ? "Business Panel" : "Command Center"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="subtle-ring hidden rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white hover:text-black lg:inline-flex"
          >
            <ChevronLeft className={cn("transition-transform duration-200", collapsed && "rotate-180")} size={14} />
          </button>
        </div>

        {/* Section based Navigation list */}
        <nav className="mt-6 flex-1 space-y-5 overflow-y-auto pr-1 select-none scrollbar-thin">
          {navSections.map((section) => {
            // Filter items based on roles
            const visibleItems = section.items.filter((item) =>
              user?.role ? item.allowedRoles.includes(user.role) : false
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1.5">
                {/* Section title subhead */}
                {!collapsed && (
                  <h5 className="px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 font-mono">
                    {section.title}
                  </h5>
                )}

                {/* Section items list */}
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "relative flex items-center gap-3.5 rounded-[12px] px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all group duration-200",
                          active
                            ? "bg-white text-black shadow-lg"
                            : "text-white/60 hover:bg-white/5 hover:text-white hover:translate-x-1.5",
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        {/* Active indicator bar */}
                        {active && (
                          <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-emerald-500" />
                        )}
                        <Icon size={16} className={cn("shrink-0", active ? "text-black" : "text-white/50 group-hover:text-white")} />
                        <span className={cn("transition-all duration-200", collapsed && "hidden w-0 opacity-0")}>
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User profile details bottom card */}
        <div className="border-t border-white/10 pt-4 mt-auto">
          {collapsed ? (
            <div className="flex flex-col items-center gap-4">
              {/* Collapsed profile trigger */}
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/80" title={user?.name}>
                {user?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-white/40 transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2.5 bg-white/5 border border-white/5 rounded-2xl p-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-400 text-black flex items-center justify-center text-xs font-bold shrink-0">
                  {user?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold text-white truncate leading-none">{user?.name}</p>
                  <div className="mt-1 flex items-center">
                    <span className={cn("text-[9px] font-bold uppercase tracking-wider font-mono border px-1.5 py-0.5 rounded", getRoleBadgeTone(user?.role || ""))}>
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
