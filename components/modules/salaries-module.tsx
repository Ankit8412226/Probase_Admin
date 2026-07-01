"use client";

import { useState } from "react";
import { Pencil, Plus, Search, Trash2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

import { SalaryForm } from "@/components/forms/salary-form";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Card, MetricCard } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportMenu } from "@/components/ui/export-menu";
import { SelectInput, TextInput, FieldGroup, FieldLabel } from "@/components/forms/form-primitives";
import { useAuth } from "@/hooks/use-auth";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useEntityManager } from "@/hooks/use-entity-manager";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";
import type { EmployeeRecord, SalaryRecord, AttendanceRecord } from "@/types";

export function SalariesModule({
  initialSalaries,
  employees,
  attendances,
}: {
  initialSalaries: SalaryRecord[];
  employees: EmployeeRecord[];
  attendances: AttendanceRecord[];
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { items, isSubmitting, error, clearError, createItem, updateItem, deleteItem } =
    useEntityManager<SalaryRecord, Omit<SalaryRecord, "id" | "createdAt" | "updatedAt">>({
      endpoint: "/api/salaries",
      initialItems: initialSalaries,
    });
  const dialog = useDisclosure();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingSalary, setEditingSalary] = useState<SalaryRecord | null>(null);
 
  // Automated Payroll states
  const [isPayrollOpen, setIsPayrollOpen] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [latePenalty, setLatePenalty] = useState(500);
  const [isRunningPayroll, setIsRunningPayroll] = useState(false);
  const [payrollSuccess, setPayrollSuccess] = useState("");
  const [payrollError, setPayrollError] = useState("");

  const canManage = user?.role === "admin";
  const filteredSalaries = items.filter((salary) => {
    const employee = employees.find((item) => item.id === salary.employeeId);
    const matchesSearch =
      employee?.name.toLowerCase().includes(search.toLowerCase()) ||
      salary.month.includes(search);
    const matchesStatus = statusFilter === "All" || salary.status === statusFilter;
    return Boolean(matchesSearch) && matchesStatus;
  });
  const exportRows = filteredSalaries.map((salary) => {
    const employee = employees.find((item) => item.id === salary.employeeId);

    return {
      employee: employee?.name ?? "Unknown employee",
      role: employee?.role ?? "",
      month: salary.month,
      amount: salary.amount,
      status: salary.status,
      paidDate: salary.paidDate ?? "",
    };
  });

  async function handleSubmit(values: Omit<SalaryRecord, "id" | "createdAt" | "updatedAt">) {
    try {
      if (editingSalary) {
        await updateItem(editingSalary.id, values);
      } else {
        await createItem(values);
      }

      setEditingSalary(null);
      dialog.close();
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this salary record?")) {
      return;
    }

    try {
      await deleteItem(id);
    } catch {}
  }

  const totalPayout = items.reduce((sum, salary) => sum + salary.amount, 0);
  const paidCount = items.filter((salary) => salary.status === "Paid").length;
  const pendingAmount = items
    .filter((salary) => salary.status === "Pending")
    .reduce((sum, salary) => sum + salary.amount, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Payroll"
        title="Salary management"
        description="Track salary runs, paid status, and payroll exposure with clear monthly records."
        actions={
          <>
            <ExportMenu
              filename="salary-records"
              label="Export Payroll"
              csvRows={exportRows}
              jsonData={filteredSalaries}
            />
            {canManage ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    clearError();
                    setPayrollSuccess("");
                    setPayrollError("");
                    setIsPayrollOpen(true);
                  }}
                >
                  <Zap size={16} className="text-amber-500 fill-amber-500" />
                  Run Payroll
                </Button>
                <Button
                  onClick={() => {
                    clearError();
                    setEditingSalary(null);
                    dialog.open();
                  }}
                >
                  <Plus size={16} />
                  Add Record
                </Button>
              </>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total payroll run" value={formatCurrency(totalPayout)} delta="Current cycle" />
        <MetricCard label="Paid records" value={String(paidCount)} delta="Processed" />
        <MetricCard
          label="Pending exposure"
          value={formatCurrency(pendingAmount)}
          delta="Awaiting release"
        />
      </div>

      <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-[16px] border border-line bg-mist px-4 py-3">
          <Search size={16} className="text-fog" />
          <TextInput
            className="h-auto border-0 bg-transparent px-0"
            placeholder="Search by employee or month"
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
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </SelectInput>
      </Card>

      {error ? (
        <div className="rounded-[18px] border border-line bg-black px-4 py-3 text-sm text-white">
          {error}
        </div>
      ) : null}

      {filteredSalaries.length ? (
        <DataTable
          data={filteredSalaries}
          emptyMessage="No salary records match the selected filters."
          columns={[
            {
              key: "employee",
              header: "Employee",
              render: (salary) => {
                const employee = employees.find((item) => item.id === salary.employeeId);
                return (
                  <div>
                    <p className="font-semibold">{employee?.name ?? "Unknown employee"}</p>
                    <p className="text-sm text-fog">{employee?.role ?? "Role unavailable"}</p>
                  </div>
                );
              },
            },
            {
              key: "month",
              header: "Month",
              render: (salary) => formatMonth(salary.month),
            },
            {
              key: "amount",
              header: "Amount",
              render: (salary) => formatCurrency(salary.amount),
            },
            {
              key: "status",
              header: "Status",
              render: (salary) => (
                <Badge tone={salary.status === "Paid" ? "success" : "neutral"}>
                  {salary.status}
                </Badge>
              ),
            },
            {
              key: "paidDate",
              header: "Paid date",
              render: (salary) => formatDate(salary.paidDate),
            },
            {
              key: "actions",
              header: "Actions",
              render: (salary) =>
                canManage ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="h-9 px-3"
                      onClick={() => {
                        clearError();
                        setEditingSalary(salary);
                        dialog.open();
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-9 px-3"
                      onClick={() => handleDelete(salary.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs uppercase tracking-[0.14em] text-fog">View only</span>
                ),
            },
          ]}
        />
      ) : (
        <EmptyState
          title="No salary records found"
          description="Try adjusting the employee search or status filter."
        />
      )}

      <Modal
        open={dialog.isOpen}
        onClose={() => {
          setEditingSalary(null);
          dialog.close();
        }}
        title={editingSalary ? "Edit salary record" : "Add salary record"}
        description="Log monthly payroll with status and settlement dates."
      >
        <SalaryForm
          employees={employees}
          initialValues={editingSalary}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setEditingSalary(null);
            dialog.close();
          }}
          onSubmit={handleSubmit}
        />
      </Modal>
 
      {/* Automated Payroll Wizard Modal */}
      <Modal
        open={isPayrollOpen}
        onClose={() => setIsPayrollOpen(false)}
        title="Automated Payroll Run"
        description="Calculate payouts automatically by applying penalty rules to attendance logs."
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <FieldLabel htmlFor="payroll-month">Target Month</FieldLabel>
              <TextInput
                id="payroll-month"
                type="month"
                value={payrollMonth}
                onChange={(e) => {
                  setPayrollSuccess("");
                  setPayrollMonth(e.target.value);
                }}
              />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="payroll-penalty">Late Penalty (per day)</FieldLabel>
              <TextInput
                id="payroll-penalty"
                type="number"
                min="0"
                value={latePenalty}
                onChange={(e) => {
                  setPayrollSuccess("");
                  setLatePenalty(Number(e.target.value));
                }}
              />
            </FieldGroup>
          </div>
 
          {/* Payroll Run Preview Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-black uppercase tracking-wider font-mono">Calculated Payout Review</h4>
            <div className="max-h-[220px] overflow-y-auto border border-line rounded-[16px] bg-mist/20 p-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line pb-2 text-fog">
                    <th className="py-2 pl-2">Employee</th>
                    <th className="py-2">Base Pay</th>
                    <th className="py-2 text-center">Late Days</th>
                    <th className="py-2">Penalty</th>
                    <th className="py-2 pr-2 text-right">Net Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/45">
                  {employees.map((emp) => {
                    const isAlreadyRun = items.some(
                      (s) => s.employeeId === emp.id && s.month === payrollMonth
                    );
                    const empLogs = attendances.filter(
                      (a) => a.userId === emp.id && a.date.startsWith(payrollMonth)
                    );
                    const lateCount = empLogs.filter((a) => a.status === "Late").length;
                    const deductions = lateCount * latePenalty;
                    const netSalary = Math.max(0, emp.salary - deductions);
 
                    return (
                      <tr key={emp.id} className="hover:bg-mist/35 transition">
                        <td className="py-2 pl-2">
                          <p className="font-semibold text-black">{emp.name}</p>
                          <p className="text-[10px] text-fog">{emp.role}</p>
                        </td>
                        <td className="py-2 font-mono">{formatCurrency(emp.salary)}</td>
                        <td className="py-2 text-center font-mono">{lateCount}</td>
                        <td className="py-2 font-mono text-red-600">-{formatCurrency(deductions)}</td>
                        <td className="py-2 pr-2 text-right font-mono font-bold">
                          {isAlreadyRun ? (
                            <span className="text-fog line-through">{formatCurrency(netSalary)}</span>
                          ) : (
                            formatCurrency(netSalary)
                          )}
                          <div className="mt-0.5">
                            {isAlreadyRun ? (
                              <Badge tone="neutral">Generated</Badge>
                            ) : (
                              <Badge tone="success">Ready</Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
 
          {payrollSuccess && (
            <div className="rounded-[16px] border border-emerald-100 bg-emerald-50 text-emerald-800 px-4 py-3 text-xs font-semibold">
              {payrollSuccess}
            </div>
          )}
 
          {payrollError && (
            <div className="rounded-[16px] border border-red-100 bg-red-50 text-red-800 px-4 py-3 text-xs font-semibold">
              {payrollError}
            </div>
          )}
 
          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsPayrollOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isRunningPayroll}
              onClick={async () => {
                setIsRunningPayroll(true);
                setPayrollSuccess("");
                setPayrollError("");
                try {
                  const res = await fetch("/api/payroll/run", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ month: payrollMonth, lateDeduction: latePenalty }),
                  });
                  const result = await res.json();
                  if (res.ok && result.success) {
                    setPayrollSuccess(result.data.message);
                    setTimeout(() => {
                      setIsPayrollOpen(false);
                      router.refresh();
                    }, 1500);
                  } else {
                    setPayrollError(result.message || "Failed to execute payroll run");
                  }
                } catch (e) {
                  setPayrollError("Network request failed.");
                } finally {
                  setIsRunningPayroll(false);
                }
              }}
            >
              <Zap size={14} className="fill-white" />
              {isRunningPayroll ? "Processing..." : "Generate Payouts"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
