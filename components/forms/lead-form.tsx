"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  FieldLabel,
  FormGrid,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/forms/form-primitives";
import type { AuthUser, LeadRecord } from "@/types";

type LeadPayload = Omit<LeadRecord, "id" | "createdAt" | "updatedAt">;

const defaultValues: LeadPayload = {
  name: "",
  contact: "",
  source: "Website",
  stage: "New",
  ownerId: "",
  status: "Not Converted",
  value: 0,
  acquisitionCost: 0,
  expectedCloseDate: "",
  lastContactDate: "",
  convertedAt: "",
  lostAt: "",
  lostReason: "",
  notes: "",
};

function deriveStatus(stage: LeadRecord["stage"]): LeadRecord["status"] {
  return stage === "Won" ? "Converted" : "Not Converted";
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

export function LeadForm({
  owners,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  owners: AuthUser[];
  initialValues?: LeadRecord | null;
  onSubmit: (values: LeadPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<LeadPayload>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        contact: initialValues.contact,
        source: initialValues.source,
        stage: initialValues.stage,
        ownerId: initialValues.ownerId,
        status: initialValues.status,
        value: initialValues.value,
        acquisitionCost: initialValues.acquisitionCost,
        expectedCloseDate: initialValues.expectedCloseDate ?? "",
        lastContactDate: initialValues.lastContactDate ?? "",
        convertedAt: initialValues.convertedAt ?? "",
        lostAt: initialValues.lostAt ?? "",
        lostReason: initialValues.lostReason ?? "",
        notes: initialValues.notes ?? "",
      });
      return;
    }

    setValues({
      ...defaultValues,
      ownerId: owners[0]?.id ?? "",
    });
  }, [initialValues, owners]);

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({
          ...values,
          status: deriveStatus(values.stage),
          convertedAt: values.stage === "Won" ? values.convertedAt || getTodayDateValue() : "",
          lostAt: values.stage === "Lost" ? values.lostAt || getTodayDateValue() : "",
          lostReason: values.stage === "Lost" ? values.lostReason : "",
        });
      }}
    >
      <FormGrid>
        <FieldGroup>
          <FieldLabel htmlFor="lead-name">Lead name</FieldLabel>
          <TextInput
            id="lead-name"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            placeholder="Grace Morgan"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="lead-contact">Contact</FieldLabel>
          <TextInput
            id="lead-contact"
            value={values.contact}
            onChange={(event) =>
              setValues((current) => ({ ...current, contact: event.target.value }))
            }
            placeholder="grace@bluepeak.io"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="lead-source">Source</FieldLabel>
          <SelectInput
            id="lead-source"
            value={values.source}
            onChange={(event) =>
              setValues((current) => ({ ...current, source: event.target.value }))
            }
          >
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Conference">Conference</option>
            <option value="Email Outreach">Email Outreach</option>
            <option value="Partner">Partner</option>
          </SelectInput>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="lead-owner">Lead owner</FieldLabel>
          <SelectInput
            id="lead-owner"
            value={values.ownerId}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                ownerId: event.target.value,
              }))
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
          <FieldLabel htmlFor="lead-stage">Stage</FieldLabel>
          <SelectInput
            id="lead-stage"
            value={values.stage}
            onChange={(event) =>
              setValues((current) => {
                const stage = event.target.value as LeadRecord["stage"];
                return {
                  ...current,
                  stage,
                  status: deriveStatus(stage),
                  convertedAt: stage === "Won" ? current.convertedAt || getTodayDateValue() : "",
                  lostAt: stage === "Lost" ? current.lostAt || getTodayDateValue() : "",
                  lostReason: stage === "Lost" ? current.lostReason : "",
                };
              })
            }
          >
            <option value="New">New</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </SelectInput>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="lead-value">Estimated value</FieldLabel>
          <TextInput
            id="lead-value"
            type="number"
            min="0"
            value={values.value}
            onChange={(event) =>
              setValues((current) => ({ ...current, value: Number(event.target.value) }))
            }
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="lead-acquisition-cost">Acquisition cost</FieldLabel>
          <TextInput
            id="lead-acquisition-cost"
            type="number"
            min="0"
            value={values.acquisitionCost}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                acquisitionCost: Number(event.target.value),
              }))
            }
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="lead-expected-close-date">Expected close date</FieldLabel>
          <TextInput
            id="lead-expected-close-date"
            type="date"
            value={values.expectedCloseDate}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                expectedCloseDate: event.target.value,
              }))
            }
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="lead-last-contact-date">Last contact</FieldLabel>
          <TextInput
            id="lead-last-contact-date"
            type="date"
            value={values.lastContactDate}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                lastContactDate: event.target.value,
              }))
            }
          />
        </FieldGroup>
      </FormGrid>
      <div className="rounded-[18px] border border-line bg-mist px-4 py-3 text-sm text-fog">
        Current status will be saved as <span className="font-semibold text-black">{deriveStatus(values.stage)}</span>
        {" "}based on the selected stage. Won stores the converted date and Lost stores the close-lost date for reports.
      </div>
      {values.stage === "Won" ? (
        <FieldGroup>
          <FieldLabel htmlFor="lead-converted-date">Converted date</FieldLabel>
          <TextInput
            id="lead-converted-date"
            type="date"
            value={values.convertedAt}
            onChange={(event) =>
              setValues((current) => ({ ...current, convertedAt: event.target.value }))
            }
          />
        </FieldGroup>
      ) : null}
      {values.stage === "Lost" ? (
        <FieldGroup>
          <FieldLabel htmlFor="lead-lost-date">Lost date</FieldLabel>
          <TextInput
            id="lead-lost-date"
            type="date"
            value={values.lostAt}
            onChange={(event) =>
              setValues((current) => ({ ...current, lostAt: event.target.value }))
            }
          />
        </FieldGroup>
      ) : null}
      {values.stage === "Lost" ? (
        <FieldGroup>
          <FieldLabel htmlFor="lead-lost-reason">Lost reason</FieldLabel>
          <TextInput
            id="lead-lost-reason"
            value={values.lostReason}
            onChange={(event) =>
              setValues((current) => ({ ...current, lostReason: event.target.value }))
            }
            placeholder="Price too high, competitor, budget freeze, etc."
            required
          />
        </FieldGroup>
      ) : null}
      <FieldGroup>
        <FieldLabel htmlFor="lead-notes">Notes</FieldLabel>
        <TextArea
          id="lead-notes"
          value={values.notes}
          onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
          placeholder="Latest objections, next step, or context"
        />
      </FieldGroup>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialValues ? "Update Lead" : "Add Lead"}
        </Button>
      </div>
    </form>
  );
}
