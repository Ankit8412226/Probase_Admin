"use client";

import { useState } from "react";
import { Pencil, Plus, Search, Trash2, ScanFace } from "lucide-react";
import { useRouter } from "next/navigation";

import { EmployeeForm } from "@/components/forms/employee-form";
import { FaceRegisterWidget } from "@/components/modules/face-register-widget";
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
import type { EmployeeRecord } from "@/types";

export function EmployeesModule({ initialEmployees }: { initialEmployees: EmployeeRecord[] }) {
  const { user } = useAuth();
  const { items, isSubmitting, error, clearError, createItem, updateItem, deleteItem } =
    useEntityManager<EmployeeRecord, Omit<EmployeeRecord, "id" | "createdAt" | "updatedAt">>({
      endpoint: "/api/employees",
      initialItems: initialEmployees,
    });
  const dialog = useDisclosure();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRecord | null>(null);
  const [registeringFaceEmployee, setRegisteringFaceEmployee] = useState<EmployeeRecord | null>(null);
  const router = useRouter();

  const canManage = user?.role === "admin";
  const roles = ["All", ...new Set(items.map((employee) => employee.role))];
  const filteredEmployees = items.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || employee.role === roleFilter;
    return matchesSearch && matchesRole;
  });
  const exportRows = filteredEmployees.map((employee) => ({
    name: employee.name,
    email: employee.email,
    role: employee.role,
    salary: employee.salary,
    joiningDate: employee.joiningDate,
  }));

  async function handleSubmit(values: Omit<EmployeeRecord, "id" | "createdAt" | "updatedAt">) {
    try {
      if (editingEmployee) {
        await updateItem(editingEmployee.id, values);
      } else {
        await createItem(values);
      }

      setEditingEmployee(null);
      dialog.close();
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this employee record?")) {
      return;
    }

    try {
      await deleteItem(id);
    } catch {}
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Employees"
        title="People operations"
        description="Manage the internal team roster, compensation bands, and hiring timeline across the business."
        actions={
          <>
            <ExportMenu
              filename="employees"
              label="Export Employees"
              csvRows={exportRows}
              jsonData={filteredEmployees}
            />
            {canManage ? (
              <Button
                onClick={() => {
                  clearError();
                  setEditingEmployee(null);
                  dialog.open();
                }}
              >
                <Plus size={16} />
                Add Employee
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
            placeholder="Search by name or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <SelectInput
          className="w-full lg:w-[240px]"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </SelectInput>
      </Card>

      {error ? (
        <div className="rounded-[18px] border border-line bg-black px-4 py-3 text-sm text-white">
          {error}
        </div>
      ) : null}

      {filteredEmployees.length ? (
        <DataTable
          data={filteredEmployees}
          emptyMessage="No employees match the selected filters."
          columns={[
            {
              key: "name",
              header: "Employee",
              render: (employee) => {
                const isFaceRegistered = !!employee.faceDescriptor && employee.faceDescriptor.length === 128;
                return (
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{employee.name}</p>
                      {isFaceRegistered && (
                        <span className="inline-flex items-center justify-center w-4.5 h-4.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100" title="Face verification enabled">
                          <ScanFace size={10} />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-fog">{employee.email}</p>
                  </div>
                );
              },
            },
            {
              key: "role",
              header: "Role",
              render: (employee) => <Badge>{employee.role}</Badge>,
            },
            {
              key: "salary",
              header: "Salary",
              render: (employee) => formatCurrency(employee.salary),
            },
            {
              key: "joiningDate",
              header: "Joined",
              render: (employee) => formatDate(employee.joiningDate),
            },
            {
              key: "actions",
              header: "Actions",
              render: (employee) =>
                canManage ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="h-9 px-3"
                      title="Manage Face Recognition"
                      onClick={() => {
                        clearError();
                        setRegisteringFaceEmployee(employee);
                      }}
                    >
                      <ScanFace size={14} />
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-9 px-3"
                      onClick={() => {
                        clearError();
                        setEditingEmployee(employee);
                        dialog.open();
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-9 px-3"
                      onClick={() => handleDelete(employee.id)}
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
          title="No employees found"
          description="Try adjusting the search input or role filter to widen the result set."
        />
      )}

      <Modal
        open={dialog.isOpen}
        onClose={() => {
          setEditingEmployee(null);
          dialog.close();
        }}
        title={editingEmployee ? "Edit employee" : "Add employee"}
        description="Keep employee records current for payroll, staffing, and planning."
      >
        <EmployeeForm
          initialValues={editingEmployee}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setEditingEmployee(null);
            dialog.close();
          }}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Modal
        open={!!registeringFaceEmployee}
        onClose={() => setRegisteringFaceEmployee(null)}
        title="Biometric Face Enrollment"
        description="Register a face recognition profile to enable touchless logins and automated check-ins."
      >
        {registeringFaceEmployee && (
          <FaceRegisterWidget
            employee={registeringFaceEmployee}
            onClose={() => setRegisteringFaceEmployee(null)}
            onRegisterSuccess={() => {
              setRegisteringFaceEmployee(null);
              router.refresh();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
