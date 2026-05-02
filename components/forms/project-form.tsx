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
import type { ClientRecord, EmployeeRecord, ProjectRecord } from "@/types";

type ProjectPayload = Omit<ProjectRecord, "id" | "createdAt" | "updatedAt">;

const defaultValues: ProjectPayload = {
  name: "",
  clientId: "",
  status: "Active",
  budget: 0,
  assignedEmployeeIds: [],
  startDate: "",
  endDate: "",
};

export function ProjectForm({
  clients,
  employees,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  clients: ClientRecord[];
  employees: EmployeeRecord[];
  initialValues?: ProjectRecord | null;
  onSubmit: (values: ProjectPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<ProjectPayload>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        clientId: initialValues.clientId,
        status: initialValues.status,
        budget: initialValues.budget,
        assignedEmployeeIds: initialValues.assignedEmployeeIds,
        startDate: initialValues.startDate,
        endDate: initialValues.endDate ?? "",
      });
      return;
    }

    setValues({
      ...defaultValues,
      clientId: clients[0]?.id ?? "",
      assignedEmployeeIds: employees.slice(0, 2).map((employee) => employee.id),
    });
  }, [clients, employees, initialValues]);

  function toggleEmployee(employeeId: string) {
    setValues((current) => ({
      ...current,
      assignedEmployeeIds: current.assignedEmployeeIds.includes(employeeId)
        ? current.assignedEmployeeIds.filter((id) => id !== employeeId)
        : [...current.assignedEmployeeIds, employeeId],
    }));
  }

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
          <FieldLabel htmlFor="project-name">Project name</FieldLabel>
          <TextInput
            id="project-name"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            placeholder="Northstar Cloud Migration"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="project-client">Client</FieldLabel>
          <SelectInput
            id="project-client"
            value={values.clientId}
            onChange={(event) =>
              setValues((current) => ({ ...current, clientId: event.target.value }))
            }
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company}
              </option>
            ))}
          </SelectInput>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="project-status">Status</FieldLabel>
          <SelectInput
            id="project-status"
            value={values.status}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                status: event.target.value as ProjectRecord["status"],
              }))
            }
          >
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </SelectInput>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="project-budget">Budget</FieldLabel>
          <TextInput
            id="project-budget"
            type="number"
            min="0"
            value={values.budget}
            onChange={(event) =>
              setValues((current) => ({ ...current, budget: Number(event.target.value) }))
            }
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="project-start-date">Start date</FieldLabel>
          <TextInput
            id="project-start-date"
            type="date"
            value={values.startDate}
            onChange={(event) =>
              setValues((current) => ({ ...current, startDate: event.target.value }))
            }
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="project-end-date">End date</FieldLabel>
          <TextInput
            id="project-end-date"
            type="date"
            value={values.endDate}
            onChange={(event) =>
              setValues((current) => ({ ...current, endDate: event.target.value }))
            }
          />
        </FieldGroup>
      </FormGrid>
      <FieldGroup>
        <FieldLabel htmlFor="project-assigned-team">Assigned team</FieldLabel>
        <div
          id="project-assigned-team"
          className="grid gap-3 rounded-[18px] border border-line bg-mist p-4 md:grid-cols-2"
        >
          {employees.map((employee) => (
            <label
              key={employee.id}
              className="flex items-center gap-3 rounded-[14px] border border-line bg-white px-3 py-3 text-sm"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-black"
                checked={values.assignedEmployeeIds.includes(employee.id)}
                onChange={() => toggleEmployee(employee.id)}
              />
              <span>
                {employee.name}
                <span className="block text-xs text-fog">{employee.role}</span>
              </span>
            </label>
          ))}
        </div>
      </FieldGroup>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialValues ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
