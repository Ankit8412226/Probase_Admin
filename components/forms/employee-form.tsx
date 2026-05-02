"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  FieldLabel,
  FormGrid,
  TextInput,
} from "@/components/forms/form-primitives";
import type { EmployeeRecord } from "@/types";

type EmployeePayload = Omit<EmployeeRecord, "id" | "createdAt" | "updatedAt">;

const defaultValues: EmployeePayload = {
  name: "",
  email: "",
  role: "",
  salary: 0,
  joiningDate: "",
};

export function EmployeeForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initialValues?: EmployeeRecord | null;
  onSubmit: (values: EmployeePayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<EmployeePayload>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        email: initialValues.email,
        role: initialValues.role,
        salary: initialValues.salary,
        joiningDate: initialValues.joiningDate,
      });
      return;
    }

    setValues(defaultValues);
  }, [initialValues]);

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
          <FieldLabel htmlFor="employee-name">Full name</FieldLabel>
          <TextInput
            id="employee-name"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            placeholder="Ava Thompson"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="employee-email">Email</FieldLabel>
          <TextInput
            id="employee-email"
            type="email"
            value={values.email}
            onChange={(event) =>
              setValues((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="ava@probase.io"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="employee-role">Role</FieldLabel>
          <TextInput
            id="employee-role"
            value={values.role}
            onChange={(event) => setValues((current) => ({ ...current, role: event.target.value }))}
            placeholder="Full Stack Developer"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="employee-salary">Monthly salary</FieldLabel>
          <TextInput
            id="employee-salary"
            type="number"
            min="0"
            value={values.salary}
            onChange={(event) =>
              setValues((current) => ({ ...current, salary: Number(event.target.value) }))
            }
            required
          />
        </FieldGroup>
      </FormGrid>
      <FieldGroup>
        <FieldLabel htmlFor="employee-joining-date">Joining date</FieldLabel>
        <TextInput
          id="employee-joining-date"
          type="date"
          value={values.joiningDate}
          onChange={(event) =>
            setValues((current) => ({ ...current, joiningDate: event.target.value }))
          }
          required
        />
      </FieldGroup>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialValues ? "Update Employee" : "Add Employee"}
        </Button>
      </div>
    </form>
  );
}
