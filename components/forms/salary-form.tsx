"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  FieldLabel,
  FormGrid,
  SelectInput,
  TextInput,
} from "@/components/forms/form-primitives";
import type { EmployeeRecord, SalaryRecord } from "@/types";

type SalaryPayload = Omit<SalaryRecord, "id" | "createdAt" | "updatedAt">;

const defaultValues: SalaryPayload = {
  employeeId: "",
  month: "",
  amount: 0,
  status: "Pending",
  paidDate: "",
};

export function SalaryForm({
  employees,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  employees: EmployeeRecord[];
  initialValues?: SalaryRecord | null;
  onSubmit: (values: SalaryPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<SalaryPayload>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        employeeId: initialValues.employeeId,
        month: initialValues.month,
        amount: initialValues.amount,
        status: initialValues.status,
        paidDate: initialValues.paidDate ?? "",
      });
      return;
    }

    setValues({
      ...defaultValues,
      employeeId: employees[0]?.id ?? "",
      month: "2025-03",
    });
  }, [employees, initialValues]);

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(values);
      }}
    >
      <FormGrid>
        <FieldGroup>
          <FieldLabel htmlFor="salary-employee">Employee</FieldLabel>
          <SelectInput
            id="salary-employee"
            value={values.employeeId}
            onChange={(event) =>
              setValues((current) => ({ ...current, employeeId: event.target.value }))
            }
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </SelectInput>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="salary-month">Month</FieldLabel>
          <TextInput
            id="salary-month"
            type="month"
            value={values.month}
            onChange={(event) => setValues((current) => ({ ...current, month: event.target.value }))}
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="salary-amount">Amount</FieldLabel>
          <TextInput
            id="salary-amount"
            type="number"
            min="0"
            value={values.amount}
            onChange={(event) =>
              setValues((current) => ({ ...current, amount: Number(event.target.value) }))
            }
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="salary-status">Status</FieldLabel>
          <SelectInput
            id="salary-status"
            value={values.status}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                status: event.target.value as SalaryRecord["status"],
              }))
            }
          >
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </SelectInput>
        </FieldGroup>
      </FormGrid>
      <FieldGroup>
        <FieldLabel htmlFor="salary-paid-date">Paid date</FieldLabel>
        <TextInput
          id="salary-paid-date"
          type="date"
          value={values.paidDate}
          onChange={(event) =>
            setValues((current) => ({ ...current, paidDate: event.target.value }))
          }
        />
      </FieldGroup>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialValues ? "Update Salary" : "Add Record"}
        </Button>
      </div>
    </form>
  );
}
