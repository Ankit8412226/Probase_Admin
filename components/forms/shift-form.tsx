"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel, FormGrid, TextInput } from "@/components/forms/form-primitives";
import type { EmployeeRecord, ShiftRecord } from "@/types";

type ShiftPayload = Omit<ShiftRecord, "id" | "createdAt" | "updatedAt">;

const defaultValues: ShiftPayload = {
  name: "",
  startTime: "09:00",
  endTime: "18:00",
  assignedEmployeeIds: [],
};

export function ShiftForm({
  employees,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  employees: EmployeeRecord[];
  initialValues?: ShiftRecord | null;
  onSubmit: (values: ShiftPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<ShiftPayload>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        startTime: initialValues.startTime,
        endTime: initialValues.endTime,
        assignedEmployeeIds: initialValues.assignedEmployeeIds || [],
      });
      return;
    }
    setValues(defaultValues);
  }, [initialValues]);

  const handleToggleEmployee = (id: string) => {
    setValues((prev) => {
      const ids = prev.assignedEmployeeIds.includes(id)
        ? prev.assignedEmployeeIds.filter((item) => item !== id)
        : [...prev.assignedEmployeeIds, id];
      return { ...prev, assignedEmployeeIds: ids };
    });
  };

  return (
    <form
      className="space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(values);
      }}
    >
      <FormGrid>
        <FieldGroup>
          <FieldLabel htmlFor="shift-name">Shift Name</FieldLabel>
          <TextInput
            id="shift-name"
            value={values.name}
            onChange={(e) => setValues((c) => ({ ...c, name: e.target.value }))}
            placeholder="e.g. General Shift"
            required
          />
        </FieldGroup>
      </FormGrid>

      <FormGrid>
        <FieldGroup>
          <FieldLabel htmlFor="shift-start">Start Time</FieldLabel>
          <TextInput
            id="shift-start"
            type="time"
            value={values.startTime}
            onChange={(e) => setValues((c) => ({ ...c, startTime: e.target.value }))}
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="shift-end">End Time</FieldLabel>
          <TextInput
            id="shift-end"
            type="time"
            value={values.endTime}
            onChange={(e) => setValues((c) => ({ ...c, endTime: e.target.value }))}
            required
          />
        </FieldGroup>
      </FormGrid>

      <div>
        <p className="text-sm font-semibold text-black mb-2">Assign Employees</p>
        <div className="max-h-[160px] overflow-y-auto border border-line rounded-[16px] p-3 space-y-2 bg-mist/35">
          {employees.map((emp) => {
            const checked = values.assignedEmployeeIds.includes(emp.id);
            return (
              <label key={emp.id} className="flex items-center gap-3 px-2 py-1.5 rounded-[12px] hover:bg-mist/70 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggleEmployee(emp.id)}
                  className="rounded border-line text-black focus:ring-black h-4 w-4"
                />
                <div>
                  <p className="text-sm font-semibold text-black">{emp.name}</p>
                  <p className="text-xs text-fog">{emp.role}</p>
                </div>
              </label>
            );
          })}
          {employees.length === 0 && (
            <p className="text-sm text-fog p-2 text-center">No active employees found</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-line pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialValues ? "Update Shift" : "Create Shift"}
        </Button>
      </div>
    </form>
  );
}
