"use client";

import { useState } from "react";
import { Download, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { InvoiceForm } from "@/components/forms/invoice-form";
import { InvoicePdfModal } from "@/components/invoices/invoice-pdf-modal";
import { SelectInput, TextInput } from "@/components/forms/form-primitives";
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
import {
  createInvoicePdfData,
  downloadInvoicePdf,
  type InvoicePdfData,
} from "@/lib/invoice-pdf";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  AuthUser,
  ClientRecord,
  InvoiceRecord,
  ProjectRecord,
} from "@/types";

function getLabel(items: Array<{ id: string; name?: string; company?: string }>, id?: string) {
  const match = items.find((item) => item.id === id);
  return match?.name ?? match?.company ?? "Unassigned";
}

export function InvoicesModule({
  initialInvoices,
  clients,
  projects,
  owners,
}: {
  initialInvoices: InvoiceRecord[];
  clients: ClientRecord[];
  projects: ProjectRecord[];
  owners: AuthUser[];
}) {
  const { items, isSubmitting, error, clearError, createItem, updateItem, deleteItem } =
    useEntityManager<InvoiceRecord, Omit<InvoiceRecord, "id" | "createdAt" | "updatedAt">>({
      endpoint: "/api/invoices",
      initialItems: initialInvoices,
    });
  const dialog = useDisclosure();
  const previewDialog = useDisclosure();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingInvoice, setEditingInvoice] = useState<InvoiceRecord | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<InvoicePdfData | null>(null);

  const filteredInvoices = items.filter((invoice) => {
    const client = clients.find((item) => item.id === invoice.clientId);
    const owner = owners.find((item) => item.id === invoice.ownerId);
    const needle = search.toLowerCase();
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(needle) ||
      client?.company.toLowerCase().includes(needle) ||
      owner?.name.toLowerCase().includes(needle);
    const matchesStatus = statusFilter === "All" || invoice.status === statusFilter;
    return Boolean(matchesSearch) && matchesStatus;
  });
  const exportRows = filteredInvoices.map((invoice) => ({
    invoiceNumber: invoice.invoiceNumber,
    client: clients.find((client) => client.id === invoice.clientId)?.company ?? "Unknown client",
    project: projects.find((project) => project.id === invoice.projectId)?.name ?? "",
    owner: getLabel(owners, invoice.ownerId),
    amount: invoice.amount,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    paidDate: invoice.paidDate ?? "",
  }));
  const outstandingAmount = filteredInvoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueCount = filteredInvoices.filter((invoice) => invoice.status === "Overdue").length;

  async function handleSubmit(values: Omit<InvoiceRecord, "id" | "createdAt" | "updatedAt">) {
    try {
      if (editingInvoice) {
        await updateItem(editingInvoice.id, values);
      } else {
        await createItem(values);
      }

      setEditingInvoice(null);
      dialog.close();
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this invoice?")) {
      return;
    }

    try {
      await deleteItem(id);
    } catch {}
  }

  function getInvoicePdfDetails(invoice: InvoiceRecord) {
    return createInvoicePdfData({
      invoice,
      client: clients.find((client) => client.id === invoice.clientId),
      project: projects.find((project) => project.id === invoice.projectId),
      owner: owners.find((owner) => owner.id === invoice.ownerId),
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Invoices"
        title="Billing and collections"
        description="Track invoice issuance, due dates, payment status, and collection risk."
        actions={
          <>
            <ExportMenu
              filename="invoices"
              label="Export Invoices"
              csvRows={exportRows}
              jsonData={filteredInvoices}
            />
            <Button
              onClick={() => {
                clearError();
                setEditingInvoice(null);
                dialog.open();
              }}
            >
              <Plus size={16} />
              Add Invoice
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Outstanding Amount"
          value={formatCurrency(outstandingAmount)}
          delta="Open collections"
        />
        <MetricCard
          label="Overdue Invoices"
          value={String(overdueCount)}
          delta="Follow-up needed"
        />
        <MetricCard
          label="Paid Invoices"
          value={String(filteredInvoices.filter((invoice) => invoice.status === "Paid").length)}
          delta="Collected"
        />
      </div>

      <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-[16px] border border-line bg-mist px-4 py-3">
          <Search size={16} className="text-fog" />
          <TextInput
            className="h-auto border-0 bg-transparent px-0"
            placeholder="Search invoice, client, or owner"
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
          <option value="Pending">Pending</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Overdue">Overdue</option>
          <option value="Paid">Paid</option>
        </SelectInput>
      </Card>

      {error ? (
        <div className="rounded-[18px] border border-line bg-black px-4 py-3 text-sm text-white">
          {error}
        </div>
      ) : null}

      {filteredInvoices.length ? (
        <DataTable
          data={filteredInvoices}
          emptyMessage="No invoices match the selected filters."
          columns={[
            {
              key: "invoice",
              header: "Invoice",
              render: (invoice) => (
                <div>
                  <p className="font-semibold">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-fog">
                    {clients.find((client) => client.id === invoice.clientId)?.company ?? "Unknown client"}
                  </p>
                </div>
              ),
            },
            {
              key: "owner",
              header: "Owner",
              render: (invoice) => getLabel(owners, invoice.ownerId),
            },
            {
              key: "amount",
              header: "Amount",
              render: (invoice) => formatCurrency(invoice.amount),
            },
            {
              key: "timeline",
              header: "Timeline",
              render: (invoice) => (
                <div>
                  <p>Issued {formatDate(invoice.issueDate)}</p>
                  <p className="text-sm text-fog">Due {formatDate(invoice.dueDate)}</p>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (invoice) => (
                <Badge tone={invoice.status === "Paid" ? "success" : invoice.status === "Overdue" ? "warning" : "neutral"}>
                  {invoice.status}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (invoice) => (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    className="h-9 px-3"
                    aria-label="View invoice PDF"
                    title="View invoice PDF"
                    onClick={() => {
                      setPreviewInvoice(getInvoicePdfDetails(invoice));
                      previewDialog.open();
                    }}
                  >
                    <Eye size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-9 px-3"
                    aria-label="Download invoice PDF"
                    title="Download invoice PDF"
                    onClick={() => downloadInvoicePdf(getInvoicePdfDetails(invoice))}
                  >
                    <Download size={14} />
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-9 px-3"
                    aria-label="Edit invoice"
                    title="Edit invoice"
                    onClick={() => {
                      clearError();
                      setEditingInvoice(invoice);
                      dialog.open();
                    }}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-9 px-3"
                    aria-label="Delete invoice"
                    title="Delete invoice"
                    onClick={() => handleDelete(invoice.id)}
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
          title="No invoices found"
          description="Add an invoice or widen the billing filters."
        />
      )}

      <Modal
        open={dialog.isOpen}
        onClose={() => {
          setEditingInvoice(null);
          dialog.close();
        }}
        title={editingInvoice ? "Edit invoice" : "Add invoice"}
        description="Manage billing records and payment follow-ups."
      >
        <InvoiceForm
          clients={clients}
          projects={projects}
          owners={owners}
          initialValues={editingInvoice}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setEditingInvoice(null);
            dialog.close();
          }}
          onSubmit={handleSubmit}
        />
      </Modal>

      <InvoicePdfModal
        open={previewDialog.isOpen}
        onClose={() => {
          setPreviewInvoice(null);
          previewDialog.close();
        }}
        invoiceData={previewInvoice}
      />
    </div>
  );
}
