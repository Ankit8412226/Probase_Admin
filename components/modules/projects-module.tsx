"use client";

import { useState } from "react";
import { Pencil, Plus, Search, Trash2, DollarSign, FileText, PlusCircle, CheckCircle } from "lucide-react";

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
import type { ClientRecord, EmployeeRecord, ProjectRecord, InvoiceRecord } from "@/types";

export function ProjectsModule({
  initialProjects,
  clients,
  employees,
  invoices: initialInvoices = [],
}: {
  initialProjects: ProjectRecord[];
  clients: ClientRecord[];
  employees: EmployeeRecord[];
  invoices?: InvoiceRecord[];
}) {
  const { user } = useAuth();
  const { items, isSubmitting, error, clearError, createItem, updateItem, deleteItem } =
    useEntityManager<ProjectRecord, Omit<ProjectRecord, "id" | "createdAt" | "updatedAt">>({
      endpoint: "/api/projects",
      initialItems: initialProjects,
    });
  const dialog = useDisclosure();
  const paymentsDialog = useDisclosure();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);

  // Invoices Local State for Instant Updates
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(initialInvoices);
  const [selectedProjectPayments, setSelectedProjectPayments] = useState<ProjectRecord | null>(null);

  // Part Payment State
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [partAmount, setPartAmount] = useState<number | string>("");
  const [partDate, setPartDate] = useState(new Date().toISOString().split("T")[0]);
  const [isAddingPartPayment, setIsAddingPartPayment] = useState(false);

  // New Invoice Milestone State
  const [showNewInvoiceForm, setShowNewInvoiceForm] = useState(false);
  const [newInvNumber, setNewInvNumber] = useState("");
  const [newInvAmount, setNewInvAmount] = useState<number | string>("");
  const [newInvIssueDate, setNewInvIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [newInvDueDate, setNewInvDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [newInvOwnerId, setNewInvOwnerId] = useState(user?.id || "");
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

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

  // Handle adding part payment
  async function handleAddPartPayment(invoice: InvoiceRecord) {
    if (!partAmount || Number(partAmount) <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }
    const amount = Number(partAmount);
    const currentPayments = invoice.partPayments || [];
    if (currentPayments.length >= 3) {
      alert("Maximum of 3 part payments are supported per invoice.");
      return;
    }
    const totalPaidAfter = currentPayments.reduce((s, p) => s + p.amount, 0) + amount;
    if (totalPaidAfter > invoice.amount) {
      alert(`Total payments (₹${totalPaidAfter}) cannot exceed invoice amount (₹${invoice.amount}).`);
      return;
    }

    setIsAddingPartPayment(true);
    try {
      const updatedPayments = [...currentPayments, { amount, paidDate: partDate }];
      const nextStatus = totalPaidAfter === invoice.amount ? "Paid" : "Partially Paid";
      const payload: Partial<InvoiceRecord> = {
        partPayments: updatedPayments,
        status: nextStatus,
      };
      if (nextStatus === "Paid") {
        payload.paidDate = partDate;
      }

      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update invoice");
      }

      // Update local state
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoice.id ? data.data : inv))
      );
      setPayingInvoiceId(null);
      setPartAmount("");
    } catch (err: any) {
      alert(err.message || "Error adding part payment.");
    } finally {
      setIsAddingPartPayment(false);
    }
  }

  // Handle creating new invoice milestone
  async function handleCreateInvoice(project: ProjectRecord) {
    if (!newInvNumber || !newInvAmount || Number(newInvAmount) <= 0) {
      alert("Please fill in all invoice details.");
      return;
    }

    setIsCreatingInvoice(true);
    try {
      const payload = {
        invoiceNumber: newInvNumber,
        clientId: project.clientId,
        projectId: project.id,
        ownerId: newInvOwnerId || user?.id || "",
        amount: Number(newInvAmount),
        issueDate: newInvIssueDate,
        dueDate: newInvDueDate,
        status: "Pending" as const,
        partPayments: [],
      };

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create invoice");
      }

      // Update local state
      setInvoices((prev) => [data.data, ...prev]);
      setShowNewInvoiceForm(false);
      setNewInvNumber("");
      setNewInvAmount("");
    } catch (err: any) {
      alert(err.message || "Error creating invoice milestone.");
    } finally {
      setIsCreatingInvoice(false);
    }
  }

  // Get Billing Summary for selected project
  const projectInvoices = selectedProjectPayments
    ? invoices.filter((inv) => inv.projectId === selectedProjectPayments.id)
    : [];
  const totalInvoiced = projectInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = projectInvoices.reduce((sum, inv) => {
    if (inv.status === "Paid") return sum + inv.amount;
    if (inv.partPayments && inv.partPayments.length > 0) {
      return sum + inv.partPayments.reduce((s, p) => s + p.amount, 0);
    }
    return sum;
  }, 0);
  const remainingToPay = Math.max(0, totalInvoiced - totalPaid);
  const remainingToInvoice = selectedProjectPayments
    ? Math.max(0, selectedProjectPayments.budget - totalInvoiced)
    : 0;

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
              key: "billing",
              header: "Billing Progress",
              render: (project) => {
                const projInvoices = invoices.filter((inv) => inv.projectId === project.id);
                const totalProjInvoiced = projInvoices.reduce((sum, inv) => sum + inv.amount, 0);
                const totalProjPaid = projInvoices.reduce((sum, inv) => {
                  if (inv.status === "Paid") return sum + inv.amount;
                  if (inv.partPayments && inv.partPayments.length > 0) {
                    return sum + inv.partPayments.reduce((s, p) => s + p.amount, 0);
                  }
                  return sum;
                }, 0);
                const unpaidInvoiced = Math.max(0, totalProjInvoiced - totalProjPaid);

                const paidPercent = Math.min(100, (totalProjPaid / project.budget) * 100);
                const unpaidPercent = Math.min(100 - paidPercent, (unpaidInvoiced / project.budget) * 100);

                return (
                  <div className="space-y-1.5 min-w-[160px]">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-emerald-600">Paid: {formatCurrency(totalProjPaid)}</span>
                      <span className="text-fog">/ {formatCurrency(project.budget)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-mist overflow-hidden flex border border-line">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${paidPercent}%` }}
                        title={`Paid: ${formatCurrency(totalProjPaid)}`}
                      />
                      <div
                        className="h-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${unpaidPercent}%` }}
                        title={`Invoiced & Unpaid: ${formatCurrency(unpaidInvoiced)}`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-fog">
                      <span>Invoiced: {formatCurrency(totalProjInvoiced)}</span>
                      {unpaidInvoiced > 0 && <span className="text-amber-600 font-semibold">Due: {formatCurrency(unpaidInvoiced)}</span>}
                    </div>
                  </div>
                );
              },
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
              render: (project) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    className="h-9 px-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50"
                    onClick={() => {
                      setSelectedProjectPayments(project);
                      paymentsDialog.open();
                    }}
                    title="Manage Payments & Installments"
                  >
                    <DollarSign size={14} />
                  </Button>
                  {canManage ? (
                    <>
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
                    </>
                  ) : null}
                </div>
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

      {/* Edit/Create Project Modal */}
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

      {/* Manage Payments & Milestone Installments Modal */}
      <Modal
        open={paymentsDialog.isOpen}
        onClose={() => {
          setSelectedProjectPayments(null);
          setShowNewInvoiceForm(false);
          setPayingInvoiceId(null);
          paymentsDialog.close();
        }}
        title="Project Billing & Part Payments"
        description={selectedProjectPayments ? `Manage installment collection and milestones for ${selectedProjectPayments.name}` : ""}
      >
        {selectedProjectPayments && (
          <div className="space-y-6">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-3 gap-2.5 bg-mist p-4 rounded-[16px] border border-line">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-fog uppercase tracking-wider">Budget</span>
                <p className="font-semibold text-black text-sm">{formatCurrency(selectedProjectPayments.budget)}</p>
              </div>
              <div className="text-center space-y-1 border-x border-line">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Paid</span>
                <p className="font-semibold text-emerald-600 text-sm">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Outstanding</span>
                <p className="font-semibold text-amber-600 text-sm">{formatCurrency(remainingToPay)}</p>
              </div>
            </div>

            {/* Invoiced Status Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-black">
                <span>Invoiced So Far: {formatCurrency(totalInvoiced)}</span>
                <span className="text-fog">Remaining to Invoice: {formatCurrency(remainingToInvoice)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-mist overflow-hidden flex border border-line">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (totalPaid / selectedProjectPayments.budget) * 100)}%` }}
                />
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (remainingToPay / selectedProjectPayments.budget) * 100)}%` }}
                />
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-fog flex items-center gap-1.5">
                  <FileText size={14} /> Linked Invoices ({projectInvoices.length})
                </h4>
                {!showNewInvoiceForm && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-8 px-2 text-xs flex items-center gap-1 text-black"
                    onClick={() => setShowNewInvoiceForm(true)}
                  >
                    <PlusCircle size={12} /> Create Milestone Invoice
                  </Button>
                )}
              </div>

              {/* Form to create new invoice installment */}
              {showNewInvoiceForm && (
                <div className="bg-white border border-black p-4 rounded-[16px] space-y-4 shadow-sm">
                  <h5 className="text-xs font-bold text-black uppercase tracking-wider">Create Installment Invoice</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-fog uppercase">Invoice Number</span>
                      <TextInput
                        placeholder="INV-XXXX-XX"
                        value={newInvNumber}
                        onChange={(e) => setNewInvNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-fog uppercase">Amount</span>
                      <TextInput
                        type="number"
                        placeholder="₹ Amount"
                        value={newInvAmount}
                        onChange={(e) => setNewInvAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-fog uppercase">Issue Date</span>
                      <TextInput
                        type="date"
                        value={newInvIssueDate}
                        onChange={(e) => setNewInvIssueDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-fog uppercase">Due Date</span>
                      <TextInput
                        type="date"
                        value={newInvDueDate}
                        onChange={(e) => setNewInvDueDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-8 px-3 text-xs"
                      onClick={() => setShowNewInvoiceForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="h-8 px-3 text-xs"
                      disabled={isCreatingInvoice}
                      onClick={() => handleCreateInvoice(selectedProjectPayments)}
                    >
                      {isCreatingInvoice ? "Creating..." : "Save Invoice"}
                    </Button>
                  </div>
                </div>
              )}

              {projectInvoices.length === 0 ? (
                <p className="text-xs text-fog italic text-center py-4 bg-white border border-line rounded-[12px]">
                  No invoices created for this project yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {projectInvoices.map((inv) => {
                    const invPaid = inv.status === "Paid" ? inv.amount : (inv.partPayments?.reduce((s, p) => s + p.amount, 0) ?? 0);
                    const invDue = Math.max(0, inv.amount - invPaid);

                    return (
                      <div key={inv.id} className="bg-white border border-line p-3.5 rounded-[16px] space-y-3 shadow-sm hover:border-black/20 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-black">{inv.invoiceNumber}</p>
                            <p className="text-[10px] text-fog">Due: {formatDate(inv.dueDate)}</p>
                          </div>
                          <Badge tone={inv.status === "Paid" ? "success" : inv.status === "Partially Paid" ? "neutral" : "alert"}>
                            {inv.status}
                          </Badge>
                        </div>

                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Total: {formatCurrency(inv.amount)}</span>
                          <span className="text-emerald-600">Paid: {formatCurrency(invPaid)}</span>
                          <span className="text-amber-600">Due: {formatCurrency(invDue)}</span>
                        </div>

                        {/* Part Payments List */}
                        {inv.partPayments && inv.partPayments.length > 0 && (
                          <div className="border-t border-line pt-2 space-y-1">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-fog">Installment Payments</span>
                            {inv.partPayments.map((p, idx) => (
                              <div key={idx} className="flex justify-between text-[10px] text-gray-600 bg-mist/30 px-2 py-1 rounded">
                                <span>Part {idx + 1}: {formatCurrency(p.amount)}</span>
                                <span>{formatDate(p.paidDate)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Record part payment form toggle */}
                        {inv.status !== "Paid" && (
                          <div className="pt-2 flex justify-end">
                            {payingInvoiceId === inv.id ? (
                              <div className="w-full space-y-3 bg-mist/40 p-3 rounded-[12px] border border-line">
                                <span className="text-[10px] font-bold text-black uppercase tracking-wider block">Record Part Payment / Installment</span>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-fog uppercase">Amount</span>
                                    <TextInput
                                      type="number"
                                      placeholder="₹ Amount"
                                      value={partAmount}
                                      onChange={(e) => setPartAmount(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-fog uppercase">Paid Date</span>
                                    <TextInput
                                      type="date"
                                      value={partDate}
                                      onChange={(e) => setPartDate(e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    className="h-7 px-2.5 text-[10px]"
                                    onClick={() => setPayingInvoiceId(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    className="h-7 px-2.5 text-[10px]"
                                    disabled={isAddingPartPayment}
                                    onClick={() => handleAddPartPayment(inv)}
                                  >
                                    {isAddingPartPayment ? "Recording..." : "Save Payment"}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="secondary"
                                className="h-7 px-2.5 text-xs text-black border border-line"
                                onClick={() => {
                                  setPayingInvoiceId(inv.id);
                                  setPartAmount("");
                                }}
                              >
                                Record Part Payment
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-line">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSelectedProjectPayments(null);
                  paymentsDialog.close();
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
