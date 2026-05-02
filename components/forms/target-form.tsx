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
import type { EmployeeRecord, TargetRecord } from "@/types";

type TargetPayload = Omit<TargetRecord, "id" | "createdAt" | "updatedAt">;

const defaultValues: TargetPayload = {
  month: "",
  ownerId: "",
  targetRevenue: 0,
  targetConversions: 0,
};

export function TargetForm({
  owners,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  owners: EmployeeRecord[];
  initialValues?: TargetRecord | null;
  onSubmit: (values: TargetPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<TargetPayload>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        month: initialValues.month,
        ownerId: initialValues.ownerId,
        targetRevenue: initialValues.targetRevenue,
        targetConversions: initialValues.targetConversions,
      });
      return;
    }

    setValues({
      ...defaultValues,
      month: "2025-03",
      ownerId: owners[0]?.id ?? "",
    });
  }, [initialValues, owners]);

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
          <FieldLabel htmlFor="target-month">Month</FieldLabel>
          <TextInput
            id="target-month"
            type="month"
            value={values.month}
            onChange={(event) => setValues((current) => ({ ...current, month: event.target.value }))}
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="target-owner">Owner</FieldLabel>
          <SelectInput
            id="target-owner"
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
          <FieldLabel htmlFor="target-revenue">Target revenue</FieldLabel>
          <TextInput
            id="target-revenue"
            type="number"
            min="0"
            value={values.targetRevenue}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                targetRevenue: Number(event.target.value),
              }))
            }
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="target-conversions">Target conversions</FieldLabel>
          <TextInput
            id="target-conversions"
            type="number"
            min="0"
            value={values.targetConversions}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                targetConversions: Number(event.target.value),
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
          {isSubmitting ? "Saving..." : initialValues ? "Update Target" : "Add Target"}
        </Button>
      </div>
    </form>
  );
}
