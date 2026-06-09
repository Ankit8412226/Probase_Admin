import { getClients } from "@/lib/services/clients";
import { getEmployees } from "@/lib/services/employees";
import { getInvoices } from "@/lib/services/invoices";
import { getLeads } from "@/lib/services/leads";
import { getProjects } from "@/lib/services/projects";
import { getProposals } from "@/lib/services/proposals";
import { getSalaries } from "@/lib/services/salaries";
import { getTargets } from "@/lib/services/targets";
import type {
  BusinessOverview,
  DashboardOverview,
  EmployeeRecord,
  InvoiceRecord,
  LeadPoint,
  RevenuePoint,
  SourcePerformancePoint,
  TargetPerformancePoint,
} from "@/types";

function parseMonth(month: string) {
  return new Date(`${month}-01T00:00:00Z`);
}

function toMonth(dateValue: string) {
  return dateValue.slice(0, 7);
}

function getLeadConversionDate(
  lead: Awaited<ReturnType<typeof getLeads>>[number],
) {
  return lead.convertedAt ?? lead.updatedAt ?? lead.createdAt;
}

function getLeadLossDate(
  lead: Awaited<ReturnType<typeof getLeads>>[number],
) {
  return lead.lostAt ?? lead.updatedAt ?? lead.createdAt;
}

function getAnchorDate(values: Array<string | undefined>) {
  const validDates = values.filter(Boolean).map((value) => new Date(String(value)));

  if (!validDates.length) {
    return new Date();
  }

  return new Date(Math.max(...validDates.map((date) => date.getTime())));
}

function getLastMonths(anchor: Date, count = 6) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - (count - 1 - index), 1));
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}

function getTargetMonths(targets: Awaited<ReturnType<typeof getTargets>>) {
  const months = Array.from(new Set(targets.map((target) => target.month))).sort();
  return months.length ? months : getLastMonths(new Date(), 3);
}

function isOverdue(invoice: InvoiceRecord, anchorDate: Date) {
  if (invoice.status === "Paid") {
    return false;
  }

  return new Date(invoice.dueDate) < anchorDate;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const [employees, projects, leads, clients, invoices] = await Promise.all([
    getEmployees(),
    getProjects(),
    getLeads(),
    getClients(),
    getInvoices(),
  ]);
  const anchorDate = getAnchorDate([
    ...clients.map((client) => client.createdAt),
    ...leads.map((lead) => lead.createdAt),
    ...leads.map((lead) => lead.convertedAt),
    ...leads.map((lead) => lead.lostAt),
    ...invoices.map((invoice) => invoice.issueDate),
  ]);

  return {
    stats: {
      totalEmployees: employees.length,
      activeProjects: projects.filter((project) => project.status === "Active").length,
      convertedLeads: leads.filter((lead) => lead.status === "Converted").length,
      monthlyRevenue: clients.reduce((total, client) => total + client.revenue, 0),
    },
    revenueTrend: buildRevenueTrend(invoices, anchorDate),
    leadConversionTrend: buildLeadTrend(leads, anchorDate),
  };
}

function getCollectedRevenueForMonth(
  invoices: Awaited<ReturnType<typeof getInvoices>>,
  month: string,
): number {
  let total = 0;
  for (const invoice of invoices) {
    if (invoice.partPayments && invoice.partPayments.length > 0) {
      const partsSum = invoice.partPayments
        .filter((p) => toMonth(p.paidDate) === month)
        .reduce((sum, p) => sum + p.amount, 0);
      total += partsSum;
    } else {
      if (invoice.status === "Paid") {
        const paidMonth = invoice.paidDate ? toMonth(invoice.paidDate) : toMonth(invoice.issueDate);
        if (paidMonth === month) {
          total += invoice.amount;
        }
      }
    }
  }
  return total;
}

function buildRevenueTrend(
  invoices: Awaited<ReturnType<typeof getInvoices>>,
  anchorDate: Date,
): RevenuePoint[] {
  const months = getLastMonths(anchorDate);

  return months.map((month) => ({
    month,
    revenue: getCollectedRevenueForMonth(invoices, month),
  }));
}

function buildLeadTrend(
  leads: Awaited<ReturnType<typeof getLeads>>,
  anchorDate: Date,
): LeadPoint[] {
  const months = getLastMonths(anchorDate);

  return months.map((month) => ({
    month,
    converted: leads.filter(
      (lead) => lead.stage === "Won" && getLeadConversionDate(lead)?.slice(0, 7) === month,
    ).length,
    nonConverted: leads.filter(
      (lead) => lead.stage === "Lost" && getLeadLossDate(lead)?.slice(0, 7) === month,
    ).length,
  }));
}

export async function getEmployeePerformance() {
  const [employees, projects, salaries] = await Promise.all([
    getEmployees(),
    getProjects(),
    getSalaries(),
  ]);

  return employees.map((employee: EmployeeRecord) => {
    const assignedProjects = projects.filter((project) =>
      project.assignedEmployeeIds.includes(employee.id),
    );
    const latestSalary = salaries.find((salary) => salary.employeeId === employee.id);

    return {
      ...employee,
      projectCount: assignedProjects.length,
      activeProjectCount: assignedProjects.filter((project) => project.status === "Active").length,
      latestSalaryStatus: latestSalary?.status ?? "Pending",
    };
  });
}

export async function getBusinessOverview(): Promise<BusinessOverview> {
  const [leads, proposals, invoices, clients, targets] = await Promise.all([
    getLeads(),
    getProposals(),
    getInvoices(),
    getClients(),
    getTargets(),
  ]);
  const anchorDate = getAnchorDate([
    ...leads.map((lead) => lead.createdAt),
    ...leads.map((lead) => lead.convertedAt),
    ...leads.map((lead) => lead.lostAt),
    ...proposals.map((proposal) => proposal.createdAt),
    ...invoices.map((invoice) => invoice.issueDate),
    ...clients.map((client) => client.contractEndDate),
    ...targets.map((target) => `${target.month}-01T00:00:00.000Z`),
  ]);

  const openLeads = leads.filter((lead) => lead.stage !== "Won" && lead.stage !== "Lost");
  const wonLeads = leads.filter((lead) => lead.stage === "Won");
  const closedLeads = leads.filter((lead) => lead.stage === "Won" || lead.stage === "Lost");
  const outstandingCollections = invoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((sum, invoice) => {
      const paidSum = invoice.partPayments?.reduce((s, p) => s + p.amount, 0) ?? 0;
      return sum + (invoice.amount - paidSum);
    }, 0);
  const renewalAlerts = clients
    .filter((client) => {
      const contractEnd = new Date(client.contractEndDate);
      const diff = contractEnd.getTime() - anchorDate.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      return client.renewalStatus === "At Risk" || client.renewalStatus === "Expired" || days <= 120;
    })
    .sort((a, b) => a.contractEndDate.localeCompare(b.contractEndDate))
    .slice(0, 5);
  const overdueInvoices = invoices
    .filter((invoice) => isOverdue(invoice, anchorDate) || invoice.status === "Overdue")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return {
    stats: {
      pipelineValue: openLeads.reduce((sum, lead) => sum + lead.value, 0),
      wonValue: wonLeads.reduce((sum, lead) => sum + lead.value, 0),
      openProposals: proposals.filter((proposal) => ["Draft", "Sent"].includes(proposal.status)).length,
      outstandingCollections,
      expiringContracts: renewalAlerts.length,
      conversionRate: closedLeads.length ? Math.round((wonLeads.length / closedLeads.length) * 100) : 0,
    },
    sourcePerformance: buildSourcePerformance(leads),
    targetVsActual: buildTargetVsActual(targets, leads, invoices),
    renewalAlerts,
    overdueInvoices,
    recentProposals: [...proposals]
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, 5),
  };
}

function buildSourcePerformance(
  leads: Awaited<ReturnType<typeof getLeads>>,
): SourcePerformancePoint[] {
  const sources = Array.from(new Set(leads.map((lead) => lead.source)));

  return sources
    .map((source) => {
      const sourceLeads = leads.filter((lead) => lead.source === source);
      const wonLeads = sourceLeads.filter((lead) => lead.stage === "Won");
      const pipelineValue = sourceLeads.reduce((sum, lead) => sum + lead.value, 0);
      const wonValue = wonLeads.reduce((sum, lead) => sum + lead.value, 0);
      const acquisitionCost = sourceLeads.reduce((sum, lead) => sum + lead.acquisitionCost, 0);

      return {
        source,
        totalLeads: sourceLeads.length,
        wonLeads: wonLeads.length,
        pipelineValue,
        wonValue,
        acquisitionCost,
        roiPercent: acquisitionCost
          ? Math.round(((wonValue - acquisitionCost) / acquisitionCost) * 100)
          : 0,
      };
    })
    .sort((a, b) => b.wonValue - a.wonValue);
}

function buildTargetVsActual(
  targets: Awaited<ReturnType<typeof getTargets>>,
  leads: Awaited<ReturnType<typeof getLeads>>,
  invoices: Awaited<ReturnType<typeof getInvoices>>,
): TargetPerformancePoint[] {
  const months = getTargetMonths(targets);

  return months.map((month) => ({
    month,
    targetRevenue: targets
      .filter((target) => target.month === month)
      .reduce((sum, target) => sum + target.targetRevenue, 0),
    actualRevenue: getCollectedRevenueForMonth(invoices, month),
    targetConversions: targets
      .filter((target) => target.month === month)
      .reduce((sum, target) => sum + target.targetConversions, 0),
    actualConversions: leads.filter(
      (lead) => lead.stage === "Won" && getLeadConversionDate(lead)?.slice(0, 7) === month,
    ).length,
  }));
}
