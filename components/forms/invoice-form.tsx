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
import type {
  AuthUser,
  ClientRecord,
  InvoiceRecord,
  ProjectRecord,
} from "@/types";

type InvoicePayload = Omit<InvoiceRecord, "id" | "createdAt" | "updatedAt">;

const defaultValues: InvoicePayload = {
  invoiceNumber: "",
  clientId: "",
  projectId: "",
  ownerId: "",
  amount: 0,
  issueDate: "",
  dueDate: "",
  status: "Pending",
  paidDate: "",
};

export function InvoiceForm({
  clients,
  projects,
  owners,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  clients: ClientRecord[];
  projects: ProjectRecord[];
  owners: AuthUser[];
  initialValues?: InvoiceRecord | null;
  onSubmit: (values: InvoicePayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<InvoicePayload>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        invoiceNumber: initialValues.invoiceNumber,
        clientId: initialValues.clientId,
        projectId: initialValues.projectId ?? "",
        ownerId: initialValues.ownerId,
        amount: initialValues.amount,
        issueDate: initialValues.issueDate,
        dueDate: initialValues.dueDate,
        status: initialValues.status,
        paidDate: initialValues.paidDate ?? "",
      });
      return;
    }

    setValues({
      ...defaultValues,
      clientId: clients[0]?.id ?? "",
      projectId: projects[0]?.id ?? "",
      ownerId: owners[0]?.id ?? "",
    });
  }, [clients, initialValues, owners, projects]);

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
          <FieldLabel htmlFor="invoice-number">Invoice number</FieldLabel>
          <TextInput
            id="invoice-number"
            value={values.invoiceNumber}
            onChange={(event) =>
              setValues((current) => ({ ...current, invoiceNumber: event.target.value }))
            }
            placeholder="INV-2025-007"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="invoice-client">Client</FieldLabel>
          <SelectInput
            id="invoice-client"
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
          <FieldLabel htmlFor="invoice-project">Project</FieldLabel>
          <SelectInput
            id="invoice-project"
            value={values.projectId}
            onChange={(event) =>
              setValues((current) => ({ ...current, projectId: event.target.value }))
            }
          >
            <option value="">Unassigned</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </SelectInput>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="invoice-owner">Owner</FieldLabel>
          <SelectInput
            id="invoice-owner"
            value={values.ownerId}
            onChange={(event) =>
              setValues((current) => ({ ...current, ownerId: event.target.value }))
            }
          >
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </SelectInput>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="invoice-amount">Amount</FieldLabel>
          <TextInput
            id="invoice-amount"
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
          <FieldLabel htmlFor="invoice-status">Status</FieldLabel>
          <SelectInput
            id="invoice-status"
            value={values.status}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                status: event.target.value as InvoiceRecord["status"],
              }))
            }
          >
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Paid">Paid</option>
          </SelectInput>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="invoice-issue-date">Issue date</FieldLabel>
          <TextInput
            id="invoice-issue-date"
            type="date"
            value={values.issueDate}
            onChange={(event) =>
              setValues((current) => ({ ...current, issueDate: event.target.value }))
            }
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="invoice-due-date">Due date</FieldLabel>
          <TextInput
            id="invoice-due-date"
            type="date"
            value={values.dueDate}
            onChange={(event) =>
              setValues((current) => ({ ...current, dueDate: event.target.value }))
            }
            required
          />
        </FieldGroup>
      </FormGrid>
      <FieldGroup>
        <FieldLabel htmlFor="invoice-paid-date">Paid date</FieldLabel>
        <TextInput
          id="invoice-paid-date"
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
          {isSubmitting ? "Saving..." : initialValues ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}
