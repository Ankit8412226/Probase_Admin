"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronDown,
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
  ShieldCheck
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  href?: string;
  label: string;
  icon: any;
  allowedRoles: string[];
  children?: Array<{ href: string; label: string }>;
}

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
      { href: "/dashboard/knowledge", label: "Playbooks", icon: BookOpen, allowedRoles: ["admin", "manager"] },
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
      {
        label: "WhatsApp CRM",
        icon: MessageSquare,
        allowedRoles: ["admin", "manager", "business", "employee"],
        children: [
          { href: "/dashboard/whatsapp", label: "Status & Pairing" },
          { href: "/dashboard/whatsapp/inbox", label: "Replies Inbox" },
          { href: "/dashboard/whatsapp/campaigns", label: "Campaigns" },
          { href: "/dashboard/whatsapp/templates", label: "Template Library" },
          { href: "/dashboard/whatsapp/chatbot", label: "Chatbot Rules" },
        ]
      },
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
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Auto-expand accordion if child path is active
  useEffect(() => {
    navSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some((c) => pathname === c.href);
          if (hasActiveChild) {
            setExpandedGroups((prev) => ({ ...prev, [item.label]: true }));
          }
        }
      });
    });
  }, [pathname]);

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

  const getRoleBadgeTone = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-50 text-purple-700 border-purple-200";
      case "manager": return "bg-amber-50 text-amber-700 border-amber-200";
      case "business": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-zinc-100 text-zinc-650 border-zinc-200";
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
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onMobileToggle}
      />
      <aside
        style={{ backgroundColor: "#ffffff" }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-line text-zinc-700 px-4 py-6 shadow-sm lg:sticky lg:top-0 lg:z-20 transition-all duration-300",
          collapsed ? "w-[84px]" : "w-[270px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Branding header */}
        <div className="flex items-center justify-between gap-3 border-b border-line pb-5 px-1.5">
          <div className={cn("flex items-center gap-2.5 overflow-hidden transition-all duration-200", collapsed && "w-0 opacity-0")}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-extrabold shadow-md shadow-emerald-500/10">
              P
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-400 leading-none">
                Probase Solutions
              </p>
              <p className="mt-1 text-xs font-semibold tracking-tight text-zinc-800 leading-none">
                {user?.role === "employee" ? "Employee Portal" : user?.role === "business" ? "Business Panel" : "Command Center"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="subtle-ring hidden rounded-xl border border-line bg-zinc-50 p-2 text-zinc-400 transition hover:bg-black hover:text-white lg:inline-flex"
          >
            <ChevronLeft className={cn("transition-transform duration-200", collapsed && "rotate-180")} size={14} />
          </button>
        </div>

        {/* Section based Navigation list */}
        <nav className="mt-6 flex-1 space-y-5 overflow-y-auto pr-1 select-none scrollbar-none">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((item) =>
              user?.role ? item.allowedRoles.includes(user.role) : false
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1.5">
                {!collapsed && (
                  <h5 className="px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 font-mono">
                    {section.title}
                  </h5>
                )}

                <div className="space-y-1">
                  {visibleItems.map((item: NavItem) => {
                    const Icon = item.icon;

                    // If item has child submenus
                    if (item.children) {
                      const isExpanded = expandedGroups[item.label];
                      const hasActiveChild = item.children.some((c) => pathname === c.href);

                      return (
                        <div key={item.label} className="space-y-1">
                          <button
                            onClick={() => {
                              if (collapsed && item.children?.[0]?.href) {
                                router.push(item.children[0].href);
                              } else {
                                setExpandedGroups((prev) => ({ ...prev, [item.label]: !prev[item.label] }));
                              }
                            }}
                            className={cn(
                              "w-full relative flex items-center justify-between rounded-[12px] px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all group duration-200 outline-none focus:outline-none",
                              hasActiveChild
                                ? "bg-zinc-100 text-black font-bold"
                                : "text-zinc-500 hover:bg-zinc-50 hover:text-black",
                            )}
                            title={collapsed ? item.label : undefined}
                          >
                            <div className="flex items-center gap-3.5">
                              <Icon size={16} className={cn("shrink-0", hasActiveChild ? "text-black" : "text-zinc-400 group-hover:text-black")} />
                              <span className={cn("transition-all duration-200 text-left", collapsed && "hidden w-0 opacity-0")}>
                                {item.label}
                              </span>
                            </div>
                            {!collapsed && (
                              <ChevronDown
                                size={12}
                                className={cn(
                                  "text-zinc-400 transition-transform duration-200",
                                  isExpanded && "rotate-180"
                                )}
                              />
                            )}
                          </button>

                          {/* Render children sub-menu list */}
                          {isExpanded && !collapsed && (
                            <div className="pl-6 space-y-1 transition-all duration-200">
                              {item.children.map((child) => {
                                const childActive = pathname === child.href;
                                return (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    className={cn(
                                      "flex items-center gap-2.5 rounded-[8px] pl-4 py-2.5 text-[11px] font-semibold transition-all duration-150 outline-none focus:outline-none",
                                      childActive
                                        ? "text-emerald-600 font-bold bg-zinc-50"
                                        : "text-zinc-400 hover:text-black hover:translate-x-1"
                                    )}
                                  >
                                    <span className={cn(
                                      "w-1 h-1 rounded-full shrink-0",
                                      childActive ? "bg-emerald-500" : "bg-zinc-300"
                                    )} />
                                    {child.label}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Standard link layout
                    const active = item.href ? (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) : false;

                    return (
                      <Link
                        key={item.label}
                        href={item.href || "#"}
                        className={cn(
                          "relative flex items-center gap-3.5 rounded-[12px] px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all group duration-200 outline-none focus:outline-none",
                          active
                            ? "bg-zinc-100 text-black shadow-sm font-bold"
                            : "text-zinc-500 hover:bg-zinc-50 hover:text-black hover:translate-x-1.5",
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        {active && (
                          <span className="absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r bg-emerald-500" />
                        )}
                        <Icon size={16} className={cn("shrink-0", active ? "text-black" : "text-zinc-400 group-hover:text-black")} />
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
        <div className="border-t border-line pt-4 mt-auto">
          {collapsed ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-line flex items-center justify-center text-xs font-bold text-zinc-700" title={user?.name}>
                {user?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-zinc-50 hover:bg-red-50 hover:text-red-600 text-zinc-400 transition-colors focus:outline-none"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2.5 bg-zinc-50 border border-line rounded-2xl p-3">
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
                  <p className="text-[11px] font-bold text-zinc-800 truncate leading-none">{user?.name}</p>
                  <div className="mt-1 flex items-center">
                    <span className={cn("text-[9px] font-bold uppercase tracking-wider font-mono border px-1.5 py-0.5 rounded", getRoleBadgeTone(user?.role || ""))}>
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-zinc-100 transition-colors shrink-0 focus:outline-none"
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
