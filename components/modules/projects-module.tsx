"use client";

import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { ProjectForm } from "@/components/forms/project-form";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportMenu } from "@/components/ui/export-menu";
import { SelectInput, TextInput } from "@/components/forms/form-primitives";
import { useAuth } from "@/hooks/use-auth";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useEntityManager } from "@/hooks/use-entity-manager";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ClientRecord, EmployeeRecord, ProjectRecord } from "@/types";

export function ProjectsModule({
  initialProjects,
  clients,
  employees,
}: {
  initialProjects: ProjectRecord[];
  clients: ClientRecord[];
  employees: EmployeeRecord[];
}) {
  const { user } = useAuth();
  const { items, isSubmitting, error, clearError, createItem, updateItem, deleteItem } =
    useEntityManager<ProjectRecord, Omit<ProjectRecord, "id" | "createdAt" | "updatedAt">>({
      endpoint: "/api/projects",
      initialItems: initialProjects,
    });
  const dialog = useDisclosure();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);

  const canManage = user?.role === "admin" || user?.role === "manager";
  const canDelete = user?.role === "admin";
  const filteredProjects = items.filter((project) => {
    const client = clients.find((item) => item.id === project.clientId);
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      client?.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || project.status === statusFilter;
    return Boolean(matchesSearch) && matchesStatus;
  });
  const exportRows = filteredProjects.map((project) => {
    const client = clients.find((item) => item.id === project.clientId);
    const assignedTeam = project.assignedEmployeeIds
      .map((employeeId) => employees.find((item) => item.id === employeeId)?.name ?? "Unknown employee")
      .join(" | ");

    return {
      project: project.name,
      client: client?.company ?? "No client linked",
      status: project.status,
      budget: project.budget,
      assignedTeam,
      startDate: project.startDate,
      endDate: project.endDate ?? "",
    };
  });

  async function handleSubmit(values: Omit<ProjectRecord, "id" | "createdAt" | "updatedAt">) {
    try {
      if (editingProject) {
        await updateItem(editingProject.id, values);
      } else {
        await createItem(values);
      }

      setEditingProject(null);
      dialog.close();
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this project?")) {
      return;
    }

    try {
      await deleteItem(id);
    } catch {}
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Projects"
        title="Delivery portfolio"
        description="Track project budgets, client ownership, delivery status, and assigned employees."
        actions={
          <>
            <ExportMenu
              filename="projects"
              label="Export Projects"
              csvRows={exportRows}
              jsonData={filteredProjects}
            />
            {canManage ? (
              <Button
                onClick={() => {
                  clearError();
                  setEditingProject(null);
                  dialog.open();
                }}
              >
                <Plus size={16} />
                Create Project
              </Button>
            ) : null}
          </>
        }
      />

      <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-[16px] border border-line bg-mist px-4 py-3">
          <Search size={16} className="text-fog" />
          <TextInput
            className="h-auto border-0 bg-transparent px-0"
            placeholder="Search project or client"
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
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </SelectInput>
      </Card>

      {error ? (
        <div className="rounded-[18px] border border-line bg-black px-4 py-3 text-sm text-white">
          {error}
        </div>
      ) : null}

      {filteredProjects.length ? (
        <DataTable
          data={filteredProjects}
          emptyMessage="No projects match the selected filters."
          columns={[
            {
              key: "project",
              header: "Project",
              render: (project) => {
                const client = clients.find((item) => item.id === project.clientId);
                return (
                  <div>
                    <p className="font-semibold">{project.name}</p>
                    <p className="text-sm text-fog">{client?.company ?? "No client linked"}</p>
                  </div>
                );
              },
            },
            {
              key: "status",
              header: "Status",
              render: (project) => (
                <Badge tone={project.status === "Active" ? "success" : "neutral"}>
                  {project.status}
                </Badge>
              ),
            },
            {
              key: "budget",
              header: "Budget",
              render: (project) => formatCurrency(project.budget),
            },
            {
              key: "team",
              header: "Assigned team",
              render: (project) => (
                <div className="space-y-1">
                  {project.assignedEmployeeIds.slice(0, 3).map((employeeId) => {
                    const employee = employees.find((item) => item.id === employeeId);
                    return (
                      <p key={employeeId} className="text-sm">
                        {employee?.name ?? "Unknown employee"}
                      </p>
                    );
                  })}
                </div>
              ),
            },
            {
              key: "dates",
              header: "Timeline",
              render: (project) => (
                <div>
                  <p>{formatDate(project.startDate)}</p>
                  <p className="text-sm text-fog">
                    {project.endDate ? `Ends ${formatDate(project.endDate)}` : "In progress"}
                  </p>
                </div>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (project) =>
                canManage ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="h-9 px-3"
                      onClick={() => {
                        clearError();
                        setEditingProject(project);
                        dialog.open();
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                    {canDelete ? (
                      <Button
                        variant="ghost"
                        className="h-9 px-3"
                        onClick={() => handleDelete(project.id)}
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
          title="No projects found"
          description="Try adjusting the project search input or status filter."
        />
      )}

      <Modal
        open={dialog.isOpen}
        onClose={() => {
          setEditingProject(null);
          dialog.close();
        }}
        title={editingProject ? "Edit project" : "Create project"}
        description="Maintain project scope, team assignment, and delivery status."
      >
        <ProjectForm
          clients={clients}
          employees={employees}
          initialValues={editingProject}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setEditingProject(null);
            dialog.close();
          }}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
