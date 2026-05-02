import { ArrowUpRight, CircleDollarSign, Sparkles, Wallet } from "lucide-react";

import { LeadConversionChart } from "@/components/charts/lead-conversion-chart";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, MetricCard } from "@/components/ui/card";
import { ExportMenu } from "@/components/ui/export-menu";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  ClientRecord,
  DashboardOverview as DashboardOverviewData,
  LeadRecord,
  ProjectRecord,
  SalaryRecord,
} from "@/types";

export function DashboardOverview({
  overview,
  projects,
  leads,
  clients,
  salaries,
}: {
  overview: DashboardOverviewData;
  projects: ProjectRecord[];
  leads: LeadRecord[];
  clients: ClientRecord[];
  salaries: SalaryRecord[];
}) {
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
              <div className="rounded-full bg-black p-3 text-white">
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
              <div className="rounded-full bg-mist p-3 text-black">
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
          <Card className="bg-black text-white">
            <div className="flex items-start justify-between gap-4">
              <CardHeader
                eyebrow="Insight"
                title="Revenue expansion is outpacing payroll growth."
                description="Current active contracts indicate room to increase delivery capacity without margin pressure."
                invert
              />
              <Sparkles size={18} className="shrink-0 text-white/70" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
