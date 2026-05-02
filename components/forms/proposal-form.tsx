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
import type { AuthUser, ClientRecord, LeadRecord, ProposalRecord } from "@/types";

type ProposalPayload = Omit<ProposalRecord, "id" | "createdAt" | "updatedAt">;

const defaultValues: ProposalPayload = {
  title: "",
  leadId: "",
  clientId: "",
  ownerId: "",
  amount: 0,
  status: "Draft",
  sentDate: "",
  validUntil: "",
};

export function ProposalForm({
  leads,
  clients,
  owners,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  leads: LeadRecord[];
  clients: ClientRecord[];
  owners: AuthUser[];
  initialValues?: ProposalRecord | null;
  onSubmit: (values: ProposalPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<ProposalPayload>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        title: initialValues.title,
        leadId: initialValues.leadId,
        clientId: initialValues.clientId ?? "",
        ownerId: initialValues.ownerId,
        amount: initialValues.amount,
        status: initialValues.status,
        sentDate: initialValues.sentDate ?? "",
        validUntil: initialValues.validUntil,
      });
      return;
    }

    setValues({
      ...defaultValues,
      leadId: leads[0]?.id ?? "",
      clientId: clients[0]?.id ?? "",
      ownerId: owners[0]?.id ?? "",
    });
  }, [clients, initialValues, leads, owners]);

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
          <FieldLabel htmlFor="proposal-title">Proposal title</FieldLabel>
          <TextInput
            id="proposal-title"
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            placeholder="Northstar migration proposal"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="proposal-lead">Lead</FieldLabel>
          <SelectInput
            id="proposal-lead"
            value={values.leadId}
            onChange={(event) => setValues((current) => ({ ...current, leadId: event.target.value }))}
          >
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name}
              </option>
            ))}
          </SelectInput>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="proposal-client">Client</FieldLabel>
          <SelectInput
            id="proposal-client"
            value={values.clientId}
            onChange={(event) =>
              setValues((current) => ({ ...current, clientId: event.target.value }))
            }
          >
            <option value="">Unassigned</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company}
              </option>
            ))}
          </SelectInput>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="proposal-owner">Owner</FieldLabel>
          <SelectInput
            id="proposal-owner"
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
          <FieldLabel htmlFor="proposal-amount">Amount</FieldLabel>
          <TextInput
            id="proposal-amount"
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
          <FieldLabel htmlFor="proposal-status">Status</FieldLabel>
          <SelectInput
            id="proposal-status"
            value={values.status}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                status: event.target.value as ProposalRecord["status"],
              }))
            }
          >
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </SelectInput>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="proposal-sent-date">Sent date</FieldLabel>
          <TextInput
            id="proposal-sent-date"
            type="date"
            value={values.sentDate}
            onChange={(event) =>
              setValues((current) => ({ ...current, sentDate: event.target.value }))
            }
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="proposal-valid-until">Valid until</FieldLabel>
          <TextInput
            id="proposal-valid-until"
            type="date"
            value={values.validUntil}
            onChange={(event) =>
              setValues((current) => ({ ...current, validUntil: event.target.value }))
            }
            required
          />
        </FieldGroup>
      </FormGrid>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialValues ? "Update Proposal" : "Create Proposal"}
        </Button>
      </div>
    </form>
  );
}
