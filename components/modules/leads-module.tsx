"use client";

import { useState } from "react";
import { Bot, Mail, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { LeadForm } from "@/components/forms/lead-form";
import { SelectInput, TextInput } from "@/components/forms/form-primitives";
import { useAuth } from "@/hooks/use-auth";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useEntityManager } from "@/hooks/use-entity-manager";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, MetricCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportMenu } from "@/components/ui/export-menu";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AuthUser, LeadRecord } from "@/types";
import { SalesCopilotSidebar } from "@/components/modules/sales-copilot-sidebar";

function getOwnerName(owners: AuthUser[], ownerId: string) {
  return owners.find((owner) => owner.id === ownerId)?.name ?? "Unassigned";
}

function getLeadTimelineLabel(lead: LeadRecord) {
  if (lead.stage === "Won" && lead.convertedAt) {
    return `Converted ${formatDate(lead.convertedAt)}`;
  }

  if (lead.stage === "Lost" && lead.lostAt) {
    return `Lost ${formatDate(lead.lostAt)}`;
  }

  if (lead.expectedCloseDate) {
    return `Close ${formatDate(lead.expectedCloseDate)}`;
  }

  return "No close date";
}

export function LeadsModule({
  initialLeads,
  owners,
}: {
  initialLeads: LeadRecord[];
  owners: AuthUser[];
}) {
  const { user } = useAuth();
  const { items, isSubmitting, error, clearError, createItem, updateItem, deleteItem } =
    useEntityManager<LeadRecord, Omit<LeadRecord, "id" | "createdAt" | "updatedAt">>({
      endpoint: "/api/leads",
      initialItems: initialLeads,
    });
  const dialog = useDisclosure();
  const [search, setSearch] = useState(() => typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("query") || "" : "");
  const [stageFilter, setStageFilter] = useState("All");
  const [editingLead, setEditingLead] = useState<LeadRecord | null>(null);
  const [pitchLead, setPitchLead] = useState<LeadRecord | null>(null);
  const [pitchContent, setPitchContent] = useState<string>("");
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [copilotLead, setCopilotLead] = useState<LeadRecord | null>(null);

  async function handleGeneratePitch(lead: LeadRecord) {
    setPitchLead(lead);
    setPitchContent("");
    setIsGeneratingPitch(true);
    // If a pitch is already saved, show it directly
    if (lead.emailPitch) {
      setPitchContent(lead.emailPitch);
      setIsGeneratingPitch(false);
      return;
    }
    try {
      const response = await fetch(`/api/leads/${lead.id}/generate-pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate");
      }
      setPitchContent(data.data.pitch);
    } catch {
      setPitchContent("Failed to generate quotation. Please try again.");
    } finally {
      setIsGeneratingPitch(false);
    }
  }

  const canManage = user?.role === "admin" || user?.role === "manager" || user?.role === "business";
  const canDelete = user?.role === "admin";
  const convertedCount = items.filter((lead) => lead.status === "Converted").length;
  const openPipelineValue = items
    .filter((lead) => lead.stage !== "Won" && lead.stage !== "Lost")
    .reduce((sum, lead) => sum + lead.value, 0);
  const filteredLeads = items.filter((lead) => {
    const needle = search.toLowerCase();
    const matchesSearch =
      lead.name.toLowerCase().includes(needle) ||
      lead.contact.toLowerCase().includes(needle) ||
      lead.source.toLowerCase().includes(needle) ||
      getOwnerName(owners, lead.ownerId).toLowerCase().includes(needle);
    const matchesStage = stageFilter === "All" || lead.stage === stageFilter;
    return matchesSearch && matchesStage;
  });
  const exportRows = filteredLeads.map((lead) => ({
    name: lead.name,
    contact: lead.contact,
    source: lead.source,
    owner: getOwnerName(owners, lead.ownerId),
    stage: lead.stage,
    status: lead.status,
    value: lead.value,
    acquisitionCost: lead.acquisitionCost,
    expectedCloseDate: lead.expectedCloseDate ?? "",
    lastContactDate: lead.lastContactDate ?? "",
    convertedAt: lead.convertedAt ?? "",
    lostAt: lead.lostAt ?? "",
    lostReason: lead.lostReason ?? "",
    createdAt: lead.createdAt ?? "",
  }));

  async function handleSubmit(values: Omit<LeadRecord, "id" | "createdAt" | "updatedAt">) {
    try {
      if (editingLead) {
        await updateItem(editingLead.id, values);
      } else {
        await createItem(values);
      }

      setEditingLead(null);
      dialog.close();
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this lead?")) {
      return;
    }

    try {
      await deleteItem(id);
    } catch {}
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Leads"
        title="Lead pipeline"
        description="Track owners, stages, acquisition cost, close dates, and conversion outcomes across the business pipeline."
        actions={
          <>
            <ExportMenu
              filename="leads"
              label="Export Leads"
              csvRows={exportRows}
              jsonData={filteredLeads}
            />
            {canManage ? (
              <Button
                onClick={() => {
                  clearError();
                  setEditingLead(null);
                  dialog.open();
                }}
              >
                <Plus size={16} />
                Add Lead
              </Button>
            ) : null}
          </>
        }
      />

      <Card className="border-slate-800 bg-slate-900 text-slate-100">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status Rule</p>
        <p className="mt-3 text-sm text-slate-300">
          Lead status changes from the lead form stage. Set stage to Won to mark it converted, or
          set stage to Lost to close it as not converted. Reports and business calculations now use
          the converted/lost date instead of only the created date.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard label="Converted leads" value={String(convertedCount)} delta="Closed opportunities" />
        <MetricCard label="Open pipeline" value={formatCurrency(openPipelineValue)} delta="Active business pipeline" />
      </div>

      <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-[16px] border border-line bg-mist px-4 py-3">
          <Search size={16} className="text-fog" />
          <TextInput
            className="h-auto border-0 bg-transparent px-0"
            placeholder="Search lead, source, owner, or contact"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <SelectInput
          className="w-full lg:w-[240px]"
          value={stageFilter}
          onChange={(event) => setStageFilter(event.target.value)}
        >
          <option value="All">All stages</option>
          <option value="New">New</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal Sent">Proposal Sent</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </SelectInput>
      </Card>

      {error ? (
        <div className="rounded-[18px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      ) : null}

      {filteredLeads.length ? (
        <DataTable
          data={filteredLeads}
          emptyMessage="No leads match the current filters."
          columns={[
            {
              key: "lead",
              header: "Lead",
              render: (lead) => (
                <div>
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-sm text-fog">{lead.contact}</p>
                </div>
              ),
            },
            {
              key: "source",
              header: "Source / Owner",
              render: (lead) => (
                <div>
                  <p>{lead.source}</p>
                  <p className="text-sm text-fog">{getOwnerName(owners, lead.ownerId)}</p>
                </div>
              ),
            },
            {
              key: "stage",
              header: "Stage",
              render: (lead) => {
                const stageTones = {
                  "New": "neutral",
                  "Qualified": "info",
                  "Proposal Sent": "info",
                  "Negotiation": "alert",
                  "Won": "success",
                  "Lost": "danger",
                } as const;

                return (
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={stageTones[lead.stage]}>{lead.stage}</Badge>
                      <Badge tone={lead.status === "Converted" ? "success" : "neutral"}>
                        {lead.status}
                      </Badge>
                    </div>
                    {lead.stage === "Lost" && lead.lostReason && (
                      <p className="text-[11px] font-medium text-red-600">
                        Reason: {lead.lostReason}
                      </p>
                    )}
                  </div>
                );
              },
            },
            {
              key: "economics",
              header: "Value / Cost",
              render: (lead) => (
                <div>
                  <p>{formatCurrency(lead.value)}</p>
                  <p className="text-sm text-fog">CAC {formatCurrency(lead.acquisitionCost)}</p>
                </div>
              ),
            },
            {
              key: "timeline",
              header: "Timeline",
              render: (lead) => (
                <div>
                  <p>{getLeadTimelineLabel(lead)}</p>
                  <p className="text-sm text-fog">
                    {lead.lastContactDate ? `Contact ${formatDate(lead.lastContactDate)}` : `Created ${formatDate(lead.createdAt)}`}
                  </p>
                </div>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (lead) =>
                canManage ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="h-9 px-3 flex items-center gap-1.5"
                      onClick={() => setCopilotLead(lead)}
                      title="Open Sales Co-Pilot"
                    >
                      <Bot size={14} />
                      <span>Co-Pilot</span>
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-9 px-3 flex items-center gap-1.5"
                      onClick={() => handleGeneratePitch(lead)}
                      title="Generate Pitch"
                    >
                      <Mail size={14} />
                      <span>AI Pitch</span>
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-9 px-3"
                      onClick={() => {
                        clearError();
                        setEditingLead(lead);
                        dialog.open();
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                    {canDelete ? (
                      <Button
                        variant="ghost"
                        className="h-9 px-3"
                        onClick={() => handleDelete(lead.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-xs uppercase tracking-[0.14em] text-fog">View only</span>
                ),
            },
          ]}
        />
      ) : (
        <EmptyState
          title="No leads found"
          description="Try adjusting the search input or stage filter to widen the pipeline view."
        />
      )}

      <Modal
        open={dialog.isOpen}
        onClose={() => {
          setEditingLead(null);
          dialog.close();
        }}
        title={editingLead ? "Edit lead" : "Add lead"}
        description="Keep the pipeline current for conversion tracking and revenue forecasting."
      >
        <LeadForm
          owners={owners}
          initialValues={editingLead}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setEditingLead(null);
            dialog.close();
          }}
          onSubmit={handleSubmit}
        />
      </Modal>
      <Modal
        open={pitchLead !== null}
        onClose={() => setPitchLead(null)}
        title="📱 WhatsApp Quotation"
        description={`Ready-to-send proposal for ${pitchLead?.name}`}
      >
        <div className="space-y-4">
          {isGeneratingPitch ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
              <span className="text-sm text-fog">Generating WhatsApp quotation with AI...</span>
            </div>
          ) : (
            <>
              {/* WhatsApp-style preview */}
              <div className="max-h-[420px] overflow-y-auto rounded-[16px] bg-[#e5ddd5] p-4">
                <div className="ml-auto max-w-[85%] rounded-[16px] rounded-tr-[4px] bg-[#dcf8c6] p-3 shadow-sm">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                    {pitchContent}
                  </pre>
                  <p className="mt-1 text-right text-[10px] text-gray-500">Probase Solution ✓✓</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-[12px] border border-line bg-mist px-3 py-2 text-xs text-fog">
                <span>💾 Auto-saved to lead record</span>
                <span>{pitchContent.length} chars</span>
              </div>
            </>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setPitchLead(null)}>
              Close
            </Button>
            {!isGeneratingPitch && pitchContent && (
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(pitchContent);
                }}
              >
                📋 Copy to WhatsApp
              </Button>
            )}
          </div>
        </div>
      </Modal>
      <SalesCopilotSidebar
        lead={copilotLead}
        open={copilotLead !== null}
        onClose={() => setCopilotLead(null)}
      />
    </div>
  );
}
