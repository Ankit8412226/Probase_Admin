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
import type { AuthUser, ClientRecord } from "@/types";

type ClientPayload = Omit<ClientRecord, "id" | "createdAt" | "updatedAt">;

const defaultValues: ClientPayload = {
  name: "",
  company: "",
  email: "",
  phone: "",
  revenue: 0,
  accountManagerId: "",
  contractStartDate: "",
  contractEndDate: "",
  renewalStatus: "On Track",
};

export function ClientForm({
  accountManagers,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  accountManagers: AuthUser[];
  initialValues?: ClientRecord | null;
  onSubmit: (values: ClientPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<ClientPayload>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        company: initialValues.company,
        email: initialValues.email,
        phone: initialValues.phone,
        revenue: initialValues.revenue,
        accountManagerId: initialValues.accountManagerId,
        contractStartDate: initialValues.contractStartDate,
        contractEndDate: initialValues.contractEndDate,
        renewalStatus: initialValues.renewalStatus,
      });
      return;
    }

    setValues({
      ...defaultValues,
      accountManagerId: accountManagers[0]?.id ?? "",
    });
  }, [accountManagers, initialValues]);

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
          <FieldLabel htmlFor="client-name">Primary contact</FieldLabel>
          <TextInput
            id="client-name"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            placeholder="Isabella Ward"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="client-company">Company</FieldLabel>
          <TextInput
            id="client-company"
            value={values.company}
            onChange={(event) =>
              setValues((current) => ({ ...current, company: event.target.value }))
            }
            placeholder="Northstar Finance"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="client-email">Email</FieldLabel>
          <TextInput
            id="client-email"
            type="email"
            value={values.email}
            onChange={(event) =>
              setValues((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="hello@company.com"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="client-phone">Phone</FieldLabel>
          <TextInput
            id="client-phone"
            value={values.phone}
            onChange={(event) =>
              setValues((current) => ({ ...current, phone: event.target.value }))
            }
            placeholder="+1 202 555 0101"
            required
          />
        </FieldGroup>
      </FormGrid>
      <FieldGroup>
        <FieldLabel htmlFor="client-revenue">Monthly revenue</FieldLabel>
        <TextInput
          id="client-revenue"
          type="number"
          min="0"
          value={values.revenue}
          onChange={(event) =>
            setValues((current) => ({ ...current, revenue: Number(event.target.value) }))
          }
          required
        />
      </FieldGroup>
      <FormGrid>
        <FieldGroup>
          <FieldLabel htmlFor="client-account-manager">Account manager</FieldLabel>
          <SelectInput
            id="client-account-manager"
            value={values.accountManagerId}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                accountManagerId: event.target.value,
              }))
            }
          >
            {accountManagers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name}
              </option>
            ))}
          </SelectInput>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="client-renewal-status">Renewal status</FieldLabel>
          <SelectInput
            id="client-renewal-status"
            value={values.renewalStatus}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                renewalStatus: event.target.value as ClientRecord["renewalStatus"],
              }))
            }
          >
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Renewed">Renewed</option>
            <option value="Expired">Expired</option>
          </SelectInput>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="client-contract-start">Contract start</FieldLabel>
          <TextInput
            id="client-contract-start"
            type="date"
            value={values.contractStartDate}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                contractStartDate: event.target.value,
              }))
            }
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="client-contract-end">Contract end</FieldLabel>
          <TextInput
            id="client-contract-end"
            type="date"
            value={values.contractEndDate}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                contractEndDate: event.target.value,
              }))
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
          {isSubmitting ? "Saving..." : initialValues ? "Update Client" : "Add Client"}
        </Button>
      </div>
    </form>
  );
}
