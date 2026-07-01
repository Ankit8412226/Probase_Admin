"use client";

import { useState } from "react";
import { Calendar, Plus, Search, Trash2, Pencil, Users, ShieldAlert, Check } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportMenu } from "@/components/ui/export-menu";
import { TextInput } from "@/components/forms/form-primitives";
import { ShiftForm } from "@/components/forms/shift-form";
import { useAuth } from "@/hooks/use-auth";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useEntityManager } from "@/hooks/use-entity-manager";
import type { EmployeeRecord, ShiftRecord } from "@/types";

export function ShiftsModule({
  initialShifts,
  employees,
}: {
  initialShifts: ShiftRecord[];
  employees: EmployeeRecord[];
}) {
  const { user } = useAuth();
  const { items, isSubmitting, error, clearError, createItem, updateItem, deleteItem } =
    useEntityManager<ShiftRecord, Omit<ShiftRecord, "id" | "createdAt" | "updatedAt">>({
      endpoint: "/api/shifts",
      initialItems: initialShifts,
    });
  const dialog = useDisclosure();
  const [search, setSearch] = useState("");
  const [editingShift, setEditingShift] = useState<ShiftRecord | null>(null);

  const canManage = user?.role === "admin";

  const filteredShifts = items.filter((shift) =>
    shift.name.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalShifts = items.length;
  
  // Scheduled employees (unique IDs)
  const scheduledIds = new Set<string>();
  items.forEach((s) => s.assignedEmployeeIds?.forEach((id) => scheduledIds.add(id)));
  const totalScheduled = scheduledIds.size;
  
  // Unscheduled employees count
  const totalUnscheduled = employees.filter((emp) => !scheduledIds.has(emp.id)).length;

  const exportRows = filteredShifts.map((shift) => ({
    name: shift.name,
    timings: `${shift.startTime} - ${shift.endTime}`,
    headcount: shift.assignedEmployeeIds?.length || 0,
  }));

  async function handleSubmit(values: Omit<ShiftRecord, "id" | "createdAt" | "updatedAt">) {
    try {
      if (editingShift) {
        await updateItem(editingShift.id, values);
      } else {
        await createItem(values);
      }
      setEditingShift(null);
      dialog.close();
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this shift? Staff inside it will be unscheduled.")) {
      return;
    }
    try {
      await deleteItem(id);
    } catch {}
  }

  // Format shift timings cleanly (e.g. 09:00 -> 9:00 AM)
  const formatTimeStr = (time: string) => {
    try {
      const [h, m] = time.split(":").map(Number);
      const isPm = h >= 12;
      const hours12 = h % 12 || 12;
      const minutesStr = m < 10 ? `0${m}` : m;
      return `${hours12}:${minutesStr} ${isPm ? "PM" : "AM"}`;
    } catch {
      return time;
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations"
        title="Shift Planner"
        description="Schedule custom shift schemes, allocate teams, and enforce shift-aligned biometric compliance."
        actions={
          <>
            <ExportMenu
              filename="shift_schedules"
              label="Export Shifts"
              csvRows={exportRows}
              jsonData={filteredShifts}
            />
            {canManage && (
              <Button
                onClick={() => {
                  clearError();
                  setEditingShift(null);
                  dialog.open();
                }}
              >
                <Plus size={16} />
                Create Shift
              </Button>
            )}
          </>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-fog font-mono">Shift Categories</p>
            <h3 className="text-2xl font-bold mt-1 text-black">{totalShifts}</h3>
          </div>
          <div className="p-3 bg-mist rounded-full text-black">
            <Calendar size={18} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-600 font-mono">Scheduled Staff</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-600">{totalScheduled}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-full text-emerald-500">
            <Users size={18} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-600 font-mono">Unscheduled Staff</p>
            <h3 className="text-2xl font-bold mt-1 text-amber-600">{totalUnscheduled}</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-full text-amber-500">
            <ShieldAlert size={18} />
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="flex items-center gap-3 rounded-[16px] border border-line bg-mist px-4 py-3">
        <Search size={16} className="text-fog" />
        <TextInput
          className="h-auto border-0 bg-transparent px-0"
          placeholder="Search by shift name..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Card>

      {error && (
        <div className="rounded-[18px] border border-line bg-black px-4 py-3 text-sm text-white">
          {error}
        </div>
      )}

      {filteredShifts.length ? (
        <DataTable
          data={filteredShifts}
          emptyMessage="No shifts matching criteria found."
          columns={[
            {
              key: "name",
              header: "Shift Name",
              render: (shift) => (
                <div>
                  <p className="font-semibold text-black">{shift.name}</p>
                  <p className="text-xs text-fog uppercase tracking-wider font-mono mt-0.5">ID: {shift.id}</p>
                </div>
              ),
            },
            {
              key: "timings",
              header: "Timings",
              render: (shift) => (
                <div className="font-semibold text-black">
                  {formatTimeStr(shift.startTime)} – {formatTimeStr(shift.endTime)}
                </div>
              ),
            },
            {
              key: "headcount",
              header: "Assigned Headcount",
              render: (shift) => {
                const count = shift.assignedEmployeeIds?.length || 0;
                return (
                  <div className="flex items-center gap-2">
                    <Badge tone={count > 0 ? "success" : "neutral"}>
                      {count} {count === 1 ? "Employee" : "Employees"}
                    </Badge>
                  </div>
                );
              },
            },
            {
              key: "actions",
              header: "Actions",
              render: (shift) =>
                canManage ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="h-9 px-3"
                      onClick={() => {
                        clearError();
                        setEditingShift(shift);
                        dialog.open();
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-9 px-3"
                      onClick={() => handleDelete(shift.id)}
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
          title="No shift schedules configured"
          description="Click Create Shift to start scheduling employee schedules."
        />
      )}

      {/* Edit/Create Shift Modal */}
      <Modal
        open={dialog.isOpen}
        onClose={() => {
          setEditingShift(null);
          dialog.close();
        }}
        title={editingShift ? "Edit Shift Schedule" : "Create Shift Schedule"}
        description="Define shift timings and allocate team members."
      >
        <ShiftForm
          employees={employees}
          initialValues={editingShift}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setEditingShift(null);
            dialog.close();
          }}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
