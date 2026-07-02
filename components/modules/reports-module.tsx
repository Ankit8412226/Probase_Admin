import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, MetricCard } from "@/components/ui/card";
import { ExportMenu } from "@/components/ui/export-menu";
import { PageHeader } from "@/components/ui/page-header";
import { LeadConversionChart } from "@/components/charts/lead-conversion-chart";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { formatCurrency } from "@/lib/utils";
import type { DashboardOverview, EmployeeRecord } from "@/types";

export function ReportsModule({
  overview,
  performance,
}: {
  overview: DashboardOverview;
  performance: Array<
    EmployeeRecord & {
      projectCount: number;
      activeProjectCount: number;
      latestSalaryStatus: string;
    }
  >;
}) {
  const trackedLeads = overview.leadConversionTrend.reduce(
    (sum, point) => sum + point.converted + point.nonConverted,
    0,
  );
  const convertedInPeriod = overview.leadConversionTrend.reduce(
    (sum, point) => sum + point.converted,
    0,
  );
  const conversionRate = trackedLeads
    ? Math.round((convertedInPeriod / trackedLeads) * 100)
    : 0;
  const activeTeamMembers = performance.filter(
    (employee) => employee.activeProjectCount > 0,
  ).length;
  const averageProjectLoad = performance.length
    ? (
        performance.reduce((sum, employee) => sum + employee.projectCount, 0) /
        performance.length
      ).toFixed(1)
    : "0.0";
  const performanceExportRows = performance.map((employee) => ({
    name: employee.name,
    role: employee.role,
    projectCount: employee.projectCount,
    activeProjectCount: employee.activeProjectCount,
    latestSalaryStatus: employee.latestSalaryStatus,
    salary: employee.salary,
    joiningDate: employee.joiningDate,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Reports"
        title="Reports and analytics"
        description="Review revenue growth, lead conversion, and employee utilization with executive-friendly summaries."
        actions={
          <ExportMenu
            filename="reports-analytics"
            label="Export Reports"
            csvRows={performanceExportRows}
            jsonData={{
              overview,
              performance,
            }}
          />
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Revenue Snapshot"
          value={formatCurrency(overview.stats.monthlyRevenue)}
          delta="Current contract value"
        />
        <MetricCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          delta={`${trackedLeads} tracked leads`}
        />
        <MetricCard
          label="Active Team Coverage"
          value={`${activeTeamMembers}/${performance.length}`}
          delta="People on live work"
        />
        <MetricCard
          label="Average Project Load"
          value={averageProjectLoad}
          delta="Projects per employee"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <RevenueChart
          data={overview.revenueTrend}
          actions={
            <ExportMenu
              filename="report-revenue-trend"
              label="Revenue Data"
              csvRows={overview.revenueTrend}
              jsonData={overview.revenueTrend}
            />
          }
        />
        <LeadConversionChart
          data={overview.leadConversionTrend}
          actions={
            <ExportMenu
              filename="report-lead-conversion"
              label="Lead Data"
              csvRows={overview.leadConversionTrend}
              jsonData={overview.leadConversionTrend}
            />
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card className="min-w-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <CardHeader
              eyebrow="Performance"
              title="Employee performance overview"
              description="High-level delivery load and payroll status across the team."
            />
            <ExportMenu
              filename="employee-performance"
              label="Performance"
              csvRows={performanceExportRows}
              jsonData={performance}
            />
          </div>
          <div className="mt-6 max-h-[560px] space-y-4 overflow-y-auto pr-1">
            {performance.map((employee) => (
              <div
                key={employee.id}
                className="rounded-[18px] border border-line bg-mist p-4"
              >
                <div className="grid gap-4 md:grid-cols-[1.5fr_repeat(3,1fr)] md:items-center">
                  <div>
                    <p className="font-semibold">{employee.name}</p>
                    <p className="text-sm text-fog">{employee.role}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-fog">Projects</p>
                    <p className="mt-1 font-semibold">{employee.projectCount}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-fog">Active</p>
                    <p className="mt-1 font-semibold">{employee.activeProjectCount}</p>
                  </div>
                  <div className="flex justify-start md:justify-end">
                    <Badge tone={employee.latestSalaryStatus === "Paid" ? "success" : "neutral"}>
                      {employee.latestSalaryStatus}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-fog">
                    <span>Delivery mix</span>
                    <span>
                      {employee.projectCount
                        ? Math.round(
                            (employee.activeProjectCount / employee.projectCount) * 100,
                          )
                        : 0}
                      % active
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-black transition-all"
                      style={{
                        width: `${
                          employee.projectCount
                            ? Math.max(
                                14,
                                Math.round(
                                  (employee.activeProjectCount / employee.projectCount) * 100,
                                ),
                              )
                            : 14
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader
              eyebrow="Summary"
              title="Revenue snapshot"
              description="Current monthly contract value."
            />
            <p className="mt-6 text-4xl font-semibold">
              {formatCurrency(overview.stats.monthlyRevenue)}
            </p>
          </Card>
          <Card>
            <CardHeader
              eyebrow="Summary"
              title="Lead conversion volume"
              description="Total converted opportunities in the tracked pipeline."
            />
            <p className="mt-6 text-4xl font-semibold">{overview.stats.convertedLeads}</p>
          </Card>
          <Card>
            <CardHeader
              eyebrow="Coverage"
              title="Team utilization"
              description="Employees currently assigned to active delivery work."
            />
            <p className="mt-6 text-4xl font-semibold">{activeTeamMembers}</p>
            <p className="mt-2 text-sm text-fog">
              {performance.length - activeTeamMembers} people are currently unassigned or between projects.
            </p>
          </Card>
          <Card className="bg-slate-900 border border-slate-800 text-slate-100">
            <CardHeader
              eyebrow="Recommendation"
              title="Protect delivery margin"
              description="Payroll and project load are healthy. Use manager access for pipeline hygiene while keeping employee and salary edits restricted to admins."
              invert
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
