"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/business", label: "Business", icon: TrendingUp },
  { href: "/dashboard/employees", label: "Employees", icon: Users },
  { href: "/dashboard/salaries", label: "Salaries", icon: DollarSign },
  { href: "/dashboard/projects", label: "Projects", icon: BriefcaseBusiness },
  { href: "/dashboard/leads", label: "Leads", icon: UserRoundSearch },
  { href: "/dashboard/knowledge", label: "Playbooks", icon: BookOpen },
  { href: "/dashboard/proposals", label: "Proposals", icon: FileText },
  { href: "/dashboard/clients", label: "Clients", icon: Building2 },
  { href: "/dashboard/invoices", label: "Invoices", icon: ReceiptText },
  { href: "/dashboard/targets", label: "Targets", icon: Target },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
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
  const { user } = useAuth();
 
  const filteredNavigation = navigation.filter((item) => {
    if (user?.role === "business") {
      return item.href !== "/dashboard/employees" && item.href !== "/dashboard/salaries";
    }
    return true;
  });
 
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
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-line bg-white/95 px-4 py-6 shadow-panel backdrop-blur lg:sticky lg:top-0 lg:z-20 lg:bg-white lg:shadow-none",
          collapsed ? "w-[92px]" : "w-[290px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "transition-transform duration-300",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line pb-5">
          <div className={cn("overflow-hidden transition-all", collapsed && "w-0 opacity-0")}>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-fog">
              Probase Solutions
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight">Admin Command Center</p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="subtle-ring hidden rounded-full border border-line bg-mist p-2 text-fog transition hover:bg-black hover:text-white lg:inline-flex"
          >
            <ChevronLeft className={cn("transition", collapsed && "rotate-180")} size={16} />
          </button>
        </div>
        <nav className="mt-8 flex-1 space-y-2 overflow-y-auto pr-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
 
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[16px] px-3 py-3 text-sm font-medium transition",
                  active
                    ? "bg-black text-white shadow-card"
                    : "text-fog hover:bg-mist hover:text-black",
                )}
              >
                <Icon size={18} />
                <span className={cn("transition-all", collapsed && "hidden")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
