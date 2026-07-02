"use client";

import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { ClientForm } from "@/components/forms/client-form";
import { TextInput } from "@/components/forms/form-primitives";
import { useAuth } from "@/hooks/use-auth";
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
import type { AuthUser, ClientRecord, ProjectRecord } from "@/types";

function getManagerName(accountManagers: AuthUser[], managerId: string) {
  return accountManagers.find((manager) => manager.id === managerId)?.name ?? "Unassigned";
}

export function ClientsModule({
  initialClients,
  projects,
  accountManagers,
}: {
  initialClients: ClientRecord[];
  projects: ProjectRecord[];
  accountManagers: AuthUser[];
}) {
  const { user } = useAuth();
  const { items, isSubmitting, error, clearError, createItem, updateItem, deleteItem } =
    useEntityManager<ClientRecord, Omit<ClientRecord, "id" | "createdAt" | "updatedAt">>({
      endpoint: "/api/clients",
      initialItems: initialClients,
    });
  const dialog = useDisclosure();
  const [search, setSearch] = useState("");
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);

  const canManage = user?.role === "admin" || user?.role === "manager" || user?.role === "business";
  const canDelete = user?.role === "admin";
  const filteredClients = items.filter((client) => {
    const needle = search.toLowerCase();
    return (
      client.name.toLowerCase().includes(needle) ||
      client.company.toLowerCase().includes(needle) ||
      client.email.toLowerCase().includes(needle) ||
      getManagerName(accountManagers, client.accountManagerId).toLowerCase().includes(needle)
    );
  });
  const exportRows = filteredClients.map((client) => ({
    company: client.company,
    primaryContact: client.name,
    email: client.email,
    phone: client.phone,
    revenue: client.revenue,
    accountManager: getManagerName(accountManagers, client.accountManagerId),
    contractStartDate: client.contractStartDate,
    contractEndDate: client.contractEndDate,
    renewalStatus: client.renewalStatus,
    associatedProjects: projects.filter((project) => project.clientId === client.id).length,
    onboarded: client.createdAt ?? "",
  }));

  async function handleSubmit(values: Omit<ClientRecord, "id" | "createdAt" | "updatedAt">) {
    try {
      if (editingClient) {
        await updateItem(editingClient.id, values);
      } else {
        await createItem(values);
      }

      setEditingClient(null);
      dialog.close();
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this client?")) {
      return;
    }

    try {
      await deleteItem(id);
    } catch {}
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Clients"
        title="Client portfolio"
        description="Manage client relationships, account ownership, renewals, and linked delivery work from one surface."
        actions={
          <>
            <ExportMenu
              filename="clients"
              label="Export Clients"
              csvRows={exportRows}
              jsonData={filteredClients}
            />
            {canManage ? (
              <Button
                onClick={() => {
                  clearError();
                  setEditingClient(null);
                  dialog.open();
                }}
              >
                <Plus size={16} />
                Add Client
              </Button>
            ) : null}
          </>
        }
      />

      <Card className="flex items-center gap-3 rounded-[16px] border border-line bg-mist px-4 py-3">
        <Search size={16} className="text-fog" />
        <TextInput
          className="h-auto border-0 bg-transparent px-0"
          placeholder="Search client, company, email, or account manager"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Card>

      {error ? (
        <div className="rounded-[18px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      ) : null}

      {filteredClients.length ? (
        <DataTable
          data={filteredClients}
          emptyMessage="No clients match the current search."
          columns={[
            {
              key: "client",
              header: "Client",
              render: (client) => (
                <div>
                  <p className="font-semibold">{client.company}</p>
                  <p className="text-sm text-fog">{client.name}</p>
                </div>
              ),
            },
            {
              key: "contact",
              header: "Contact / Owner",
              render: (client) => (
                <div>
                  <p>{client.email}</p>
                  <p className="text-sm text-fog">
                    {client.phone} • {getManagerName(accountManagers, client.accountManagerId)}
                  </p>
                </div>
              ),
            },
            {
              key: "revenue",
              header: "Monthly revenue",
              render: (client) => formatCurrency(client.revenue),
            },
            {
              key: "contract",
              header: "Contract",
              render: (client) => (
                <div>
                  <p>Ends {formatDate(client.contractEndDate)}</p>
                  <p className="text-sm text-fog">Starts {formatDate(client.contractStartDate)}</p>
                </div>
              ),
            },
            {
              key: "renewal",
              header: "Renewal",
              render: (client) => (
                <div className="flex flex-col gap-2">
                  <Badge tone={client.renewalStatus === "On Track" || client.renewalStatus === "Renewed" ? "success" : client.renewalStatus === "At Risk" ? "warning" : "neutral"}>
                    {client.renewalStatus}
                  </Badge>
                  <span className="text-xs uppercase tracking-[0.14em] text-fog">
                    {projects.filter((project) => project.clientId === client.id).length} projects
                  </span>
                </div>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (client) =>
                canManage ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="h-9 px-3"
                      onClick={() => {
                        clearError();
                        setEditingClient(client);
                        dialog.open();
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                    {canDelete ? (
                      <Button
                        variant="ghost"
                        className="h-9 px-3"
                        onClick={() => handleDelete(client.id)}
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
          title="No clients found"
          description="Try adjusting the client search to inspect a broader portfolio."
        />
      )}

      <Modal
        open={dialog.isOpen}
        onClose={() => {
          setEditingClient(null);
          dialog.close();
        }}
        title={editingClient ? "Edit client" : "Add client"}
        description="Maintain client details, billing value, and relationship ownership."
      >
        <ClientForm
          accountManagers={accountManagers}
          initialValues={editingClient}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setEditingClient(null);
            dialog.close();
          }}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
