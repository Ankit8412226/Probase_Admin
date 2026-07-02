"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Bot, LogOut, Search, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { SalesCopilotSidebar } from "@/components/modules/sales-copilot-sidebar";

export function TopNavbar() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  // Search State
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load search data
  async function loadSearchData() {
    if (leads.length > 0) return;
    setLoadingSearch(true);
    try {
      const [resLeads, resProjects, resEmployees, resPlaybooks] = await Promise.all([
        fetch("/api/leads").then((r) => r.json()),
        fetch("/api/projects").then((r) => r.json()),
        fetch("/api/employees").then((r) => r.json()),
        fetch("/api/knowledge").then((r) => r.json()),
      ]);
      if (resLeads.success) setLeads(resLeads.data);
      if (resProjects.success) setProjects(resProjects.data);
      if (resEmployees.success) setEmployees(resEmployees.data);
      if (resPlaybooks.success) setPlaybooks(resPlaybooks.data);
    } catch (err) {
      console.error("Search data load error", err);
    } finally {
      setLoadingSearch(false);
    }
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Match search items
  const query = searchQuery.toLowerCase().trim();
  const matchedLeads = query
    ? leads.filter((l) => l.name.toLowerCase().includes(query) || l.contact?.toLowerCase().includes(query)).slice(0, 3)
    : [];
  const matchedProjects = query
    ? projects.filter((p) => p.name.toLowerCase().includes(query)).slice(0, 3)
    : [];
  const matchedEmployees = query
    ? employees.filter((e) => e.name.toLowerCase().includes(query) || e.role?.toLowerCase().includes(query)).slice(0, 3)
    : [];
  const matchedPlaybooks = query
    ? playbooks.filter((p) => p.title.toLowerCase().includes(query)).slice(0, 3)
    : [];

  const hasResults =
    matchedLeads.length > 0 ||
    matchedProjects.length > 0 ||
    matchedEmployees.length > 0 ||
    matchedPlaybooks.length > 0;

  function navigateToModule(path: string, itemQuery: string) {
    setSearchFocused(false);
    setSearchQuery("");
    router.push(`${path}?query=${encodeURIComponent(itemQuery)}`);
  }

  return (
    <div className="sticky top-0 z-30 flex flex-col gap-4 border-b border-slate-900 bg-slate-950/85 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      {/* Search Input Container */}
      <div 
        ref={searchContainerRef}
        className="relative flex-1 max-w-md"
      >
        <div className="flex items-center gap-3 rounded-[16px] border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-indigo-500/50 transition-all duration-200">
          <Search size={16} className="text-fog" />
          <input
            type="text"
            placeholder="Search employees, projects, leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              setSearchFocused(true);
              loadSearchData();
            }}
            className="bg-transparent border-0 outline-none text-sm text-slate-200 placeholder:text-fog w-full"
          />
        </div>

        {/* Dropdown Results Overlay */}
        {searchFocused && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-40 max-h-[380px] overflow-y-auto space-y-4">
            {loadingSearch ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border border-slate-500 border-t-transparent" />
                <span>Syncing indexes...</span>
              </div>
            ) : !query ? (
              <div className="text-xs text-slate-400 py-2">
                Type to instantly search leads, projects, employees, or playbooks.
              </div>
            ) : !hasResults ? (
              <div className="text-xs text-slate-500 py-2">
                No matching results found for "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Leads section */}
                {matchedLeads.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">Leads</h5>
                    <div className="space-y-1">
                      {matchedLeads.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => navigateToModule("/dashboard/leads", l.name)}
                          className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex justify-between items-center transition"
                        >
                          <span className="font-semibold">{l.name}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">{l.stage}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects section */}
                {matchedProjects.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">Projects</h5>
                    <div className="space-y-1">
                      {matchedProjects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => navigateToModule("/dashboard/projects", p.name)}
                          className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex justify-between items-center transition"
                        >
                          <span className="font-semibold">{p.name}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">{p.status}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Employees section */}
                {matchedEmployees.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">Employees</h5>
                    <div className="space-y-1">
                      {matchedEmployees.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => navigateToModule("/dashboard/employees", e.name)}
                          className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex justify-between items-center transition"
                        >
                          <span className="font-semibold">{e.name}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">{e.role}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Playbooks section */}
                {matchedPlaybooks.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">Playbooks</h5>
                    <div className="space-y-1">
                      {matchedPlaybooks.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => navigateToModule("/dashboard/knowledge", p.title)}
                          className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex justify-between items-center transition"
                        >
                          <span className="font-semibold truncate max-w-[280px]">{p.title}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">Doc</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsCopilotOpen(true)}
          title="Open Sales Co-Pilot"
          className="subtle-ring inline-flex h-11 px-4 items-center justify-center gap-2 rounded-full border border-slate-800 bg-slate-900 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
        >
          <Bot size={16} className="text-indigo-400" />
          <span>Sales Co-Pilot</span>
        </button>
        <button
          type="button"
          className="subtle-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-fog transition hover:bg-slate-800 hover:text-white"
        >
          <Bell size={16} />
        </button>
        <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            {user?.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
            <p className="flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-fog">
              <ShieldCheck size={12} />
              {isDemoMode ? "demo admin" : user?.role}
            </p>
          </div>
          {isDemoMode ? (
            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-fog">
              Demo Mode
            </span>
          ) : (
            <Button variant="ghost" className="h-9 px-3" onClick={handleLogout}>
              <LogOut size={14} />
            </Button>
          )}
        </div>
      </div>

      <SalesCopilotSidebar
        lead={null}
        open={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
}
