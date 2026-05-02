import { CircleAlert, FileText, Goal, ReceiptText, TrendingUp } from "lucide-react";

import { DataTable } from "@/components/tables/data-table";
import { Card, CardHeader, MetricCard } from "@/components/ui/card";
import { ExportMenu } from "@/components/ui/export-menu";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";
import type {
  AuthUser,
  BusinessOverview,
  ClientRecord,
  InvoiceRecord,
  LeadRecord,
  ProposalRecord,
  TargetRecord,
} from "@/types";

function getOwnerName(owners: AuthUser[], ownerId: string) {
  return owners.find((owner) => owner.id === ownerId)?.name ?? "Unassigned";
}

export function BusinessOverviewModule({
  overview,
  owners,
  leads,
  proposals,
  invoices,
  clients,
  targets,
}: {
  overview: BusinessOverview;
  owners: AuthUser[];
  leads: LeadRecord[];
  proposals: ProposalRecord[];
  invoices: InvoiceRecord[];
  clients: ClientRecord[];
  targets: TargetRecord[];
}) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Business"
        title="Business command center"
        description="Give the growth and account team a single place to track pipeline quality, proposals, renewals, collections, and monthly targets."
        actions={
          <ExportMenu
            filename="business-overview"
            label="Export Business"
            jsonData={{ overview, leads, proposals, invoices, clients, targets }}
            csvRows={overview.targetVsActual}
          />
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Pipeline Value"
          value={formatCurrency(overview.stats.pipelineValue)}
          delta="Open opportunities"
        />
        <MetricCard
          label="Won Value"
          value={formatCurrency(overview.stats.wonValue)}
          delta="Closed revenue"
        />
        <MetricCard
          label="Open Proposals"
          value={String(overview.stats.openProposals)}
          delta="Draft and sent"
        />
        <MetricCard
          label="Close Rate"
          value={`${overview.stats.conversionRate}%`}
          delta="Won vs closed leads"
        />
        <MetricCard
          label="Collections at Risk"
          value={formatCurrency(overview.stats.outstandingCollections)}
          delta={`${overview.stats.expiringContracts} contracts expiring`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <CardHeader
              eyebrow="Source ROI"
              title="Channel performance"
              description="Lead source quality, won value, and acquisition efficiency."
            />
            <ExportMenu
              filename="business-source-performance"
              label="Export Sources"
              csvRows={overview.sourcePerformance}
              jsonData={overview.sourcePerformance}
            />
          </div>
          <div className="mt-6 space-y-4">
            {overview.sourcePerformance.map((source) => (
              <div key={source.source} className="rounded-[18px] border border-line bg-mist p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold">{source.source}</p>
                    <p className="mt-1 text-sm text-fog">
                      {source.wonLeads}/{source.totalLeads} won • {formatCurrency(source.acquisitionCost)} acquisition cost
                    </p>
                  </div>
                  <Badge tone={source.roiPercent >= 100 ? "success" : "neutral"}>
                    ROI {source.roiPercent}%
                  </Badge>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-fog">Pipeline</p>
                    <p className="mt-1 font-semibold">{formatCurrency(source.pipelineValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-fog">Won value</p>
                    <p className="mt-1 font-semibold">{formatCurrency(source.wonValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-fog">Conversion</p>
                    <p className="mt-1 font-semibold">
                      {source.totalLeads
                        ? Math.round((source.wonLeads / source.totalLeads) * 100)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <CardHeader
              eyebrow="Targets"
              title="Target vs actual"
              description="Monthly target attainment across revenue and conversions."
            />
            <ExportMenu
              filename="business-target-performance"
              label="Export Targets"
              csvRows={overview.targetVsActual}
              jsonData={overview.targetVsActual}
            />
          </div>
          <div className="mt-6 space-y-4">
            {overview.targetVsActual.map((point) => {
              const revenueProgress = point.targetRevenue
                ? Math.round((point.actualRevenue / point.targetRevenue) * 100)
                : 0;
              const conversionProgress = point.targetConversions
                ? Math.round((point.actualConversions / point.targetConversions) * 100)
                : 0;

              return (
                <div key={point.month} className="rounded-[18px] border border-line bg-mist p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{formatMonth(point.month)}</p>
                    <Badge tone={revenueProgress >= 100 ? "success" : "neutral"}>
                      {revenueProgress}% revenue attainment
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-fog">Revenue</span>
                        <span>
                          {formatCurrency(point.actualRevenue)} / {formatCurrency(point.targetRevenue)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-black"
                          style={{ width: `${Math.min(revenueProgress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-fog">Conversions</span>
                        <span>
                          {point.actualConversions} / {point.targetConversions}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-black/70"
                          style={{ width: `${Math.min(conversionProgress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <CardHeader
              eyebrow="Renewals"
              title="Contract renewal alerts"
              description="Accounts requiring expansion or renewal attention."
            />
            <CircleAlert className="text-fog" size={18} />
          </div>
          <div className="mt-6 space-y-3">
            {overview.renewalAlerts.map((client) => (
              <div
                key={client.id}
                className="flex flex-col gap-3 rounded-[16px] border border-line px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold">{client.company}</p>
                  <p className="text-sm text-fog">
                    {getOwnerName(owners, client.accountManagerId)} • Ends {formatDate(client.contractEndDate)}
                  </p>
                </div>
                <Badge tone={client.renewalStatus === "On Track" || client.renewalStatus === "Renewed" ? "success" : "warning"}>
                  {client.renewalStatus}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <CardHeader
              eyebrow="Collections"
              title="Overdue invoices"
              description="Outstanding invoices requiring follow-up from the business team."
            />
            <ReceiptText className="text-fog" size={18} />
          </div>
          <div className="mt-6 space-y-3">
            {overview.overdueInvoices.map((invoice) => {
              const client = clients.find((item) => item.id === invoice.clientId);
              return (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-3 rounded-[16px] border border-line px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-fog">
                      {client?.company ?? "Unknown client"} • Due {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatCurrency(invoice.amount)}</span>
                    <Badge tone={invoice.status === "Overdue" ? "warning" : "neutral"}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <CardHeader
            eyebrow="Proposals"
            title="Recent proposal movement"
            description="Most recent quotes, owners, and commercial status."
          />
          <FileText className="text-fog" size={18} />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {overview.recentProposals.map((proposal) => (
            <div key={proposal.id} className="rounded-[18px] border border-line bg-mist p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{proposal.title}</p>
                <Badge tone={proposal.status === "Accepted" ? "success" : "neutral"}>
                  {proposal.status}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-fog">
                {getOwnerName(owners, proposal.ownerId)} • Valid until {formatDate(proposal.validUntil)}
              </p>
              <p className="mt-4 text-xl font-semibold">{formatCurrency(proposal.amount)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
