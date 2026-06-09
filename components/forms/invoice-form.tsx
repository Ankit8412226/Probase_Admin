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
  partPayments: [],
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
        partPayments: initialValues.partPayments ?? [],
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
        
        let finalValues = { ...values };
        if (values.status === "Partially Paid") {
          const parts = values.partPayments ?? [];
          if (parts.length === 0) {
            alert("Please add at least one part payment for Partially Paid status.");
            return;
          }
          const sum = parts.reduce((s, p) => s + p.amount, 0);
          if (sum > values.amount) {
            alert(`Total part payments (${sum}) cannot exceed invoice amount (${values.amount}).`);
            return;
          }
          if (sum === values.amount) {
            alert(`Total part payments equal invoice amount. Invoice status will be saved as "Paid".`);
            const sortedDates = [...parts].map(p => p.paidDate).sort();
            const latestDate = sortedDates[sortedDates.length - 1] || new Date().toISOString().split("T")[0];
            finalValues.status = "Paid";
            finalValues.paidDate = latestDate;
          }
        } else if (values.status === "Paid") {
          const parts = values.partPayments ?? [];
          if (parts.length > 0) {
            const sum = parts.reduce((s, p) => s + p.amount, 0);
            if (sum !== values.amount) {
              alert(`To save a "Paid" invoice with part payments, the total paid (${sum}) must equal the invoice amount (${values.amount}).`);
              return;
            }
          } else {
            if (!values.paidDate) {
              alert("Please specify a Paid Date for a Paid invoice.");
              return;
            }
          }
        } else {
          // Clear part payments and paid date if pending/overdue
          finalValues.partPayments = [];
          finalValues.paidDate = "";
        }

        await onSubmit(finalValues);
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
            onChange={(event) => {
              const newStatus = event.target.value as InvoiceRecord["status"];
              setValues((current) => {
                const updated = {
                  ...current,
                  status: newStatus,
                };
                if (newStatus === "Partially Paid" && (!current.partPayments || current.partPayments.length === 0)) {
                  updated.partPayments = [
                    { amount: 0, paidDate: current.paidDate || new Date().toISOString().split("T")[0] },
                  ];
                }
                return updated;
              });
            }}
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
      {values.status === "Paid" && (!values.partPayments || values.partPayments.length === 0) && (
        <FieldGroup>
          <FieldLabel htmlFor="invoice-paid-date">Paid date</FieldLabel>
          <TextInput
            id="invoice-paid-date"
            type="date"
            value={values.paidDate}
            onChange={(event) =>
              setValues((current) => ({ ...current, paidDate: event.target.value }))
            }
            required
          />
        </FieldGroup>
      )}

      {(values.status === "Partially Paid" || (values.status === "Paid" && values.partPayments && values.partPayments.length > 0)) && (
        <div className="rounded-[18px] border border-line bg-mist p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">Part Payments</h4>
              <p className="text-xs text-fog">Track up to 3 installment payments by the client.</p>
            </div>
            {(!values.partPayments || values.partPayments.length < 3) && (
              <Button
                type="button"
                variant="secondary"
                className="h-8 px-2 text-xs"
                onClick={() => {
                  const currentParts = values.partPayments ?? [];
                  setValues((current) => ({
                    ...current,
                    partPayments: [...currentParts, { amount: 0, paidDate: new Date().toISOString().split("T")[0] }],
                  }));
                }}
              >
                + Add Payment
              </Button>
            )}
          </div>
          {(!values.partPayments || values.partPayments.length === 0) && (
            <p className="text-xs text-fog">No part payments added yet. Click above to add one.</p>
          )}
          <div className="space-y-3">
            {values.partPayments?.map((payment, index) => (
              <div key={index} className="flex items-end gap-3 bg-white p-3 rounded-[12px] border border-line">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fog">
                    Amount ({index + 1})
                  </span>
                  <TextInput
                    type="number"
                    min="1"
                    value={payment.amount || ""}
                    onChange={(e) => {
                      const newParts = [...(values.partPayments ?? [])];
                      newParts[index] = { ...newParts[index], amount: Number(e.target.value) };
                      setValues((current) => ({ ...current, partPayments: newParts }));
                    }}
                    required
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fog">
                    Paid Date
                  </span>
                  <TextInput
                    type="date"
                    value={payment.paidDate || ""}
                    onChange={(e) => {
                      const newParts = [...(values.partPayments ?? [])];
                      newParts[index] = { ...newParts[index], paidDate: e.target.value };
                      setValues((current) => ({ ...current, partPayments: newParts }));
                    }}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 px-3 text-red-500 hover:text-red-700"
                  onClick={() => {
                    const newParts = (values.partPayments ?? []).filter((_, i) => i !== index);
                    setValues((current) => ({ ...current, partPayments: newParts }));
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          {values.partPayments && values.partPayments.length > 0 && (
            <div className="text-xs text-fog flex justify-between px-1">
              <span>Total Paid: ${values.partPayments.reduce((s, p) => s + p.amount, 0)}</span>
              <span>Remaining: ${Math.max(0, values.amount - values.partPayments.reduce((s, p) => s + p.amount, 0))}</span>
            </div>
          )}
        </div>
      )}

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
