"use client";

import { useState, useEffect } from "react";
import { FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { ProposalForm } from "@/components/forms/proposal-form";
import { SelectInput, TextInput } from "@/components/forms/form-primitives";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useEntityManager } from "@/hooks/use-entity-manager";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportMenu } from "@/components/ui/export-menu";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AuthUser, ClientRecord, LeadRecord, ProposalRecord } from "@/types";

function getName(items: Array<{ id: string; name: string }>, id?: string) {
  return items.find((item) => item.id === id)?.name ?? "Unassigned";
}

export function ProposalsModule({
  initialProposals,
  leads,
  clients,
  owners,
}: {
  initialProposals: ProposalRecord[];
  leads: LeadRecord[];
  clients: ClientRecord[];
  owners: AuthUser[];
}) {
  const { items, isSubmitting, error, clearError, createItem, updateItem, deleteItem } =
    useEntityManager<ProposalRecord, Omit<ProposalRecord, "id" | "createdAt" | "updatedAt">>({
      endpoint: "/api/proposals",
      initialItems: initialProposals,
    });
  const dialog = useDisclosure();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingProposal, setEditingProposal] = useState<ProposalRecord | null>(null);
  const [viewingProposal, setViewingProposal] = useState<ProposalRecord | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [viewingProposal]);

  const filteredProposals = items.filter((proposal) => {
    const lead = leads.find((item) => item.id === proposal.leadId);
    const client = clients.find((item) => item.id === proposal.clientId);
    const owner = owners.find((item) => item.id === proposal.ownerId);
    const needle = search.toLowerCase();
    const matchesSearch =
      proposal.title.toLowerCase().includes(needle) ||
      lead?.name.toLowerCase().includes(needle) ||
      client?.company.toLowerCase().includes(needle) ||
      owner?.name.toLowerCase().includes(needle);
    const matchesStatus = statusFilter === "All" || proposal.status === statusFilter;
    return Boolean(matchesSearch) && matchesStatus;
  });
  const exportRows = filteredProposals.map((proposal) => ({
    title: proposal.title,
    lead: leads.find((lead) => lead.id === proposal.leadId)?.name ?? "Unknown lead",
    client: clients.find((client) => client.id === proposal.clientId)?.company ?? "",
    owner: getName(owners, proposal.ownerId),
    amount: proposal.amount,
    status: proposal.status,
    sentDate: proposal.sentDate ?? "",
    validUntil: proposal.validUntil,
  }));

  async function handleSubmit(values: Omit<ProposalRecord, "id" | "createdAt" | "updatedAt">) {
    try {
      if (editingProposal) {
        await updateItem(editingProposal.id, values);
      } else {
        await createItem(values);
      }

      setEditingProposal(null);
      dialog.close();
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this proposal?")) {
      return;
    }

    try {
      await deleteItem(id);
    } catch {}
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Proposals"
        title="Quotation and proposal tracker"
        description="Manage commercial documents, proposal validity, ownership, and acceptance outcomes."
        actions={
          <>
            <ExportMenu
              filename="proposals"
              label="Export Proposals"
              csvRows={exportRows}
              jsonData={filteredProposals}
            />
            <Button
              onClick={() => {
                clearError();
                setEditingProposal(null);
                dialog.open();
              }}
            >
              <Plus size={16} />
              Add Proposal
            </Button>
          </>
        }
      />

      <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-[16px] border border-line bg-mist px-4 py-3">
          <Search size={16} className="text-fog" />
          <TextInput
            className="h-auto border-0 bg-transparent px-0"
            placeholder="Search proposal, lead, client, or owner"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <SelectInput
          className="w-full lg:w-[240px]"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All statuses</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Expired">Expired</option>
        </SelectInput>
      </Card>

      {error ? (
        <div className="rounded-[18px] border border-line bg-black px-4 py-3 text-sm text-white">
          {error}
        </div>
      ) : null}

      {filteredProposals.length ? (
        <DataTable
          data={filteredProposals}
          emptyMessage="No proposals match the selected filters."
          columns={[
            {
              key: "title",
              header: "Proposal",
              render: (proposal) => (
                <button
                  type="button"
                  className="text-left group hover:underline focus:outline-none"
                  onClick={() => setViewingProposal(proposal)}
                >
                  <p className="font-semibold text-black group-hover:text-black">{proposal.title}</p>
                  <p className="text-xs text-fog">
                    {leads.find((lead) => lead.id === proposal.leadId)?.name ?? "Unknown lead"}
                  </p>
                </button>
              ),
            },
            {
              key: "client",
              header: "Client",
              render: (proposal) =>
                clients.find((client) => client.id === proposal.clientId)?.company ?? "Unassigned",
            },
            {
              key: "owner",
              header: "Owner",
              render: (proposal) => getName(owners, proposal.ownerId),
            },
            {
              key: "amount",
              header: "Amount",
              render: (proposal) => formatCurrency(proposal.amount),
            },
            {
              key: "status",
              header: "Status",
              render: (proposal) => (
                <Badge tone={proposal.status === "Accepted" ? "success" : "neutral"}>
                  {proposal.status}
                </Badge>
              ),
            },
            {
              key: "timeline",
              header: "Timeline",
              render: (proposal) => (
                <div>
                  <p>{proposal.sentDate ? `Sent ${formatDate(proposal.sentDate)}` : "Not sent"}</p>
                  <p className="text-sm text-fog">Valid until {formatDate(proposal.validUntil)}</p>
                </div>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (proposal) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    className="h-9 px-3"
                    title="View Proposal Details"
                    onClick={() => setViewingProposal(proposal)}
                  >
                    <FileText size={14} />
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-9 px-3"
                    onClick={() => {
                      clearError();
                      setEditingProposal(proposal);
                      dialog.open();
                    }}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-9 px-3"
                    onClick={() => handleDelete(proposal.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      ) : (
        <EmptyState
          title="No proposals found"
          description="Add a proposal or widen the search and status filters."
        />
      )}

      <Modal
        open={dialog.isOpen}
        onClose={() => {
          setEditingProposal(null);
          dialog.close();
        }}
        title={editingProposal ? "Edit proposal" : "Add proposal"}
        description="Track proposal ownership, status, and commercial value."
      >
        <ProposalForm
          leads={leads}
          clients={clients}
          owners={owners}
          initialValues={editingProposal}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setEditingProposal(null);
            dialog.close();
          }}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* Viewing Proposal Details Modal */}
      <Modal
        open={!!viewingProposal}
        onClose={() => setViewingProposal(null)}
        title={viewingProposal?.title || "Proposal Details"}
        description={`Commercial Value: ${viewingProposal ? formatCurrency(viewingProposal.amount) : "—"} • Status: ${viewingProposal?.status || "Draft"}`}
      >
        <div className="space-y-4">
          <div className="max-h-[360px] overflow-y-auto border border-line rounded-[16px] p-4 bg-mist/35 text-sm text-black whitespace-pre-wrap font-sans leading-relaxed">
            {viewingProposal?.content ? (
              viewingProposal.content
            ) : (
              <p className="text-fog text-center py-6">No detailed content generated for this proposal yet. Edit the proposal or use the AI Copilot to generate deliverables.</p>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t border-line pt-4">
            {viewingProposal?.content && (
              <Button
                variant="secondary"
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(viewingProposal.content || "");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch (err) {
                    console.error("Failed to copy content:", err);
                  }
                }}
                className="flex items-center gap-1.5"
              >
                {copied ? "✅ Copied!" : "📋 Copy Proposal"}
              </Button>
            )}
            <Button
              variant="secondary"
              type="button"
              onClick={() => setViewingProposal(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
