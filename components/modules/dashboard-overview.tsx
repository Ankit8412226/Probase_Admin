"use client";

import { ArrowUpRight, CircleDollarSign, Sparkles, Wallet, Clock, Calendar, UserCheck, Coins, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { LeadConversionChart } from "@/components/charts/lead-conversion-chart";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, MetricCard } from "@/components/ui/card";
import { ExportMenu } from "@/components/ui/export-menu";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type {
  ClientRecord,
  DashboardOverview as DashboardOverviewData,
  LeadRecord,
  ProjectRecord,
  SalaryRecord,
  AttendanceRecord,
} from "@/types";

export function DashboardOverview({
  overview,
  projects,
  leads,
  clients,
  salaries,
  attendances = [],
}: {
  overview: DashboardOverviewData;
  projects: ProjectRecord[];
  leads: LeadRecord[];
  clients: ClientRecord[];
  salaries: SalaryRecord[];
  attendances?: AttendanceRecord[];
}) {
  const { user } = useAuth();
  
  const isStaff = user?.role === "employee" || user?.role === "business";

  // ----------------------------------------------------
  // STAFF (Personalized Dashboard)
  // ----------------------------------------------------
  if (isStaff) {
    const myProjects = projects.filter((p) => p.assignedEmployeeIds?.includes(user!.id));
    const myLeads = leads.filter((l) => l.ownerId === user!.id);
    const myLogs = attendances.filter((a) => a.userId === user!.id).slice(0, 5);
    const mySalaries = salaries.filter((s) => s.employeeId === user!.id);
    const latestSalary = mySalaries[0]; // Already sorted by date/month usually

    const onTimeLogs = attendances.filter((a) => a.userId === user!.id && a.status === "Present").length;
    const totalLogs = attendances.filter((a) => a.userId === user!.id).length;
    const complianceRate = totalLogs > 0 ? Math.round((onTimeLogs / totalLogs) * 100) : 100;

    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          eyebrow="Portal Home"
          title={`Welcome back, ${user?.name}`}
          description="Access your assigned projects, lead pipelines, attendance history, and monthly compensation slips from a secure hub."
        />

        {/* Personal Metrics */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Assigned Projects"
            value={String(myProjects.length)}
            delta="Active delivery"
          />
          <MetricCard
            label="Attendance Compliance"
            value={`${complianceRate}%`}
            delta={`${onTimeLogs} of ${totalLogs} check-ins on-time`}
          />
          <MetricCard
            label="Owned Sales Leads"
            value={String(myLeads.length)}
            delta="Pipeline value"
          />
          <MetricCard
            label="Latest Net Payout"
            value={latestSalary ? formatCurrency(latestSalary.amount) : "—"}
            delta={latestSalary ? `Status: ${latestSalary.status}` : "No salary logs yet"}
          />
        </div>

        {/* Personalized Main Content Columns */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          {/* Projects and Leads */}
          <div className="space-y-6">
            <Card>
              <CardHeader
                eyebrow="My Projects"
                title="Your active engagements"
                description="List of active project delivery tasks allocated to you."
              />
              <div className="mt-6 space-y-4">
                {myProjects.length > 0 ? (
                  myProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex flex-col gap-3 rounded-[18px] border border-line bg-mist p-4 md:flex-row md:items-center md:justify-between hover:border-black/20 transition"
                    >
                      <div>
                        <p className="font-semibold text-black">{project.name}</p>
                        <p className="mt-1 text-xs text-fog">
                          Started {formatDate(project.startDate)} {project.endDate ? `• Target ${formatDate(project.endDate)}` : ""}
                        </p>
                      </div>
                      <Badge tone={project.status === "Active" ? "success" : "neutral"}>
                        {project.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-fog py-4 text-center">You are not assigned to any active projects.</p>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader
                eyebrow="My Leads"
                title="Pipeline opportunities"
                description="Leads you own or are actively communicating with."
              />
              <div className="mt-6 space-y-3">
                {myLeads.length > 0 ? (
                  myLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between rounded-[16px] border border-line px-4 py-3 hover:border-black/20 transition"
                    >
                      <div>
                        <p className="font-semibold text-black">{lead.name}</p>
                        <p className="text-xs text-fog">
                          Source: {lead.source} • Value: {formatCurrency(lead.value)}
                        </p>
                      </div>
                      <Badge tone={lead.status === "Converted" ? "success" : "neutral"}>
                        {lead.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-fog py-4 text-center">You do not own any active sales leads.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Right column: Attendance Logs & Payroll slips */}
          <div className="space-y-6">
            <Card>
              <CardHeader
                eyebrow="Attendance"
                title="Recent Check-ins"
                description="Your latest daily biometric and login sessions."
              />
              <div className="mt-6 space-y-3">
                {myLogs.length > 0 ? (
                  myLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between rounded-[16px] border border-line px-4 py-3"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-black text-xs">{formatDate(log.date)}</p>
                        <p className="text-[10px] text-fog">Check-in: {formatTime(log.loginTime)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge tone={log.status === "Present" ? "success" : "alert"}>
                          {log.status === "Present" ? "On Time" : "Late"}
                        </Badge>
                        <span className="text-[9px] text-fog uppercase tracking-wider font-mono">
                          via {log.method}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-fog py-4 text-center">No attendance sessions recorded yet.</p>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader
                eyebrow="Compensation"
                title="Salary Slip History"
                description="List of your monthly salaries processed by admin."
              />
              <div className="mt-6 space-y-3">
                {mySalaries.length > 0 ? (
                  mySalaries.map((salary) => (
                    <div
                      key={salary.id}
                      className="flex items-center justify-between rounded-[16px] border border-line px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-black text-xs">{formatDate(salary.paidDate || salary.createdAt) || salary.month}</p>
                        <p className="text-[10px] text-fog">Month: {salary.month}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold">{formatCurrency(salary.amount)}</span>
                        <Badge tone={salary.status === "Paid" ? "success" : "neutral"}>
                          {salary.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-fog py-4 text-center">No salary releases configured for your profile.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ADMIN & MANAGER (Full Company Overview Dashboard)
  // ----------------------------------------------------
  const recentProjects = [...projects]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 3);
  const latestLeads = [...leads]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 4);
  const pendingPayroll = salaries
    .filter((salary) => salary.status === "Pending")
    .reduce((sum, salary) => sum + salary.amount, 0);
  const summaryExportRows = [
    { metric: "Total Employees", value: overview.stats.totalEmployees },
    { metric: "Active Projects", value: overview.stats.activeProjects },
    { metric: "Converted Leads", value: overview.stats.convertedLeads },
    { metric: "Monthly Revenue", value: overview.stats.monthlyRevenue },
    { metric: "Pending Payroll Exposure", value: pendingPayroll },
    { metric: "Active Client Accounts", value: clients.length },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations"
        title="Company-wide visibility in one premium surface"
        description="Track employees, clients, project delivery, payroll status, and sales conversion from a single command center."
        actions={
          <ExportMenu
            filename="dashboard-overview"
            label="Export Overview"
            csvRows={summaryExportRows}
            jsonData={{
              overview,
              projects,
              leads,
              clients,
              salaries,
            }}
          />
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Employees"
          value={String(overview.stats.totalEmployees)}
          delta="+8% headcount"
        />
        <MetricCard
          label="Active Projects"
          value={String(overview.stats.activeProjects)}
          delta="Live delivery"
        />
        <MetricCard
          label="Converted Leads"
          value={String(overview.stats.convertedLeads)}
          delta="Strong close rate"
        />
        <MetricCard
          label="Monthly Revenue"
          value={formatCurrency(overview.stats.monthlyRevenue)}
          delta="Recurring contracts"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <RevenueChart
          data={overview.revenueTrend}
          actions={
            <ExportMenu
              filename="overview-revenue-trend"
              label="Trend"
              csvRows={overview.revenueTrend}
              jsonData={overview.revenueTrend}
            />
          }
        />
        <LeadConversionChart
          data={overview.leadConversionTrend}
          actions={
            <ExportMenu
              filename="overview-lead-conversion"
              label="Pipeline"
              csvRows={overview.leadConversionTrend}
              jsonData={overview.leadConversionTrend}
            />
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card>
          <div className="flex items-center justify-between">
            <CardHeader
              eyebrow="Projects"
              title="Recent delivery activity"
              description="Latest engagements entering or moving through delivery."
            />
            <ArrowUpRight size={18} className="text-fog" />
          </div>
          <div className="mt-6 space-y-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col gap-3 rounded-[18px] border border-line bg-mist p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold">{project.name}</p>
                  <p className="mt-1 text-sm text-fog">
                    Started {formatDate(project.startDate)} • Budget {formatCurrency(project.budget)}
                  </p>
                </div>
                <Badge tone={project.status === "Active" ? "success" : "neutral"}>
                  {project.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <div className="min-w-0 space-y-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-slate-900 p-3 text-slate-100">
                <CircleDollarSign size={18} />
              </div>
              <div>
                <p className="text-sm text-fog">Pending payroll exposure</p>
                <p className="text-2xl font-semibold">{formatCurrency(pendingPayroll)}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-mist p-3 text-slate-200">
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-sm text-fog">Active client accounts</p>
                <p className="text-2xl font-semibold">{clients.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader
              eyebrow="Leads"
              title="Latest pipeline signals"
              description="Recent inbound opportunities and current disposition."
            />
            <div className="mt-6 space-y-3">
              {latestLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-[16px] border border-line px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-fog">
                      {lead.source} • {formatCurrency(lead.value)}
                    </p>
                  </div>
                  <Badge tone={lead.status === "Converted" ? "success" : "neutral"}>
                    {lead.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card className="bg-slate-900 border border-slate-800 text-slate-100">
            <div className="flex items-start justify-between gap-4">
              <CardHeader
                eyebrow="Insight"
                title="Revenue expansion is outpacing payroll growth."
                description="Current active contracts indicate room to increase delivery capacity without margin pressure."
                invert
              />
              <Sparkles size={18} className="shrink-0 text-slate-100/70" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
