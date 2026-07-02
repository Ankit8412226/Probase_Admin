"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  FieldLabel,
  FormGrid,
  SelectInput,
  TextInput,
  TextArea,
} from "@/components/forms/form-primitives";
import type { AuthUser, ClientRecord, LeadRecord, ProposalRecord } from "@/types";

type ProposalPayload = Omit<ProposalRecord, "id" | "createdAt" | "updatedAt">;

const defaultValues: ProposalPayload = {
  title: "",
  leadId: "",
  clientId: "",
  recipientName: "",
  recipientPhone: "",
  ownerId: "",
  amount: 0,
  status: "Draft",
  sentDate: "",
  validUntil: "",
  content: "",
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

  // AI states
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [copiedContent, setCopiedContent] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setValues({
        title: initialValues.title,
        leadId: initialValues.leadId ?? "",
        clientId: initialValues.clientId ?? "",
        recipientName: initialValues.recipientName ?? "",
        recipientPhone: initialValues.recipientPhone ?? "",
        ownerId: initialValues.ownerId,
        amount: initialValues.amount,
        status: initialValues.status,
        sentDate: initialValues.sentDate ?? "",
        validUntil: initialValues.validUntil,
        content: initialValues.content ?? "",
      });
      return;
    }

    setValues({
      ...defaultValues,
      leadId: "",
      clientId: "",
      recipientName: "",
      recipientPhone: "",
      ownerId: owners[0]?.id ?? "",
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // default 30 days validity
    });
  }, [clients, initialValues, leads, owners]);

  // Call AI generator API
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      setAiError("Please describe the project details first.");
      return;
    }

    setIsGenerating(true);
    setAiError("");

    try {
      const response = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const { title, amount, content } = result.data;
        setValues((prev) => ({
          ...prev,
          title: title || prev.title,
          amount: amount || prev.amount,
          content: content || prev.content,
        }));
      } else {
        setAiError(result.message || "Failed to generate proposal.");
      }
    } catch (err) {
      setAiError("Connection error while communicating with AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form
      className="space-y-5 max-w-2xl mx-auto"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(values);
      }}
    >
      {/* AI Wizard Panel */}
      {!initialValues && (
        <div className="rounded-[18px] border border-amber-200/50 bg-amber-50/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-800">
            <Sparkles size={16} className="text-amber-500 fill-amber-500" />
            <h4 className="text-sm font-bold tracking-tight">AI Proposal Copilot</h4>
          </div>
          <p className="text-xs text-fog">
            Describe what organization features you want to build and the target budget. Gemini AI will generate the proposal details, amount, and markdown modules.
          </p>
          <div className="flex gap-2">
            <TextInput
              placeholder="e.g. Next.js SaaS app with clean analytics, 3 months delivery, budget ₹2,50,000"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="bg-white border-amber-200/60 focus:border-amber-400"
              disabled={isGenerating}
            />
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 bg-amber-100/60 text-amber-800 border border-amber-200/55 hover:bg-amber-100"
              onClick={handleAiGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : "Draft ✨"}
            </Button>
          </div>
          {aiError && (
            <p className="text-xs text-red-600 font-semibold">{aiError}</p>
          )}
        </div>
      )}

      <FormGrid>
        <FieldGroup>
          <FieldLabel htmlFor="proposal-title">Proposal title</FieldLabel>
          <TextInput
            id="proposal-title"
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            placeholder="e.g. Next.js Migration Blueprint"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="proposal-lead">Lead (Optional)</FieldLabel>
          <SelectInput
            id="proposal-lead"
            value={values.leadId}
            onChange={(event) => setValues((current) => ({ ...current, leadId: event.target.value }))}
          >
            <option value="">Unassigned</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name}
              </option>
            ))}
          </SelectInput>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="proposal-client">Client (Optional)</FieldLabel>
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
          <FieldLabel htmlFor="proposal-recipient-name">Recipient Name (Optional)</FieldLabel>
          <TextInput
            id="proposal-recipient-name"
            value={values.recipientName || ""}
            onChange={(event) => setValues((current) => ({ ...current, recipientName: event.target.value }))}
            placeholder="e.g. Rahul Sharma"
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="proposal-recipient-phone">Recipient Phone (Optional - WhatsApp)</FieldLabel>
          <TextInput
            id="proposal-recipient-phone"
            value={values.recipientPhone || ""}
            onChange={(event) => setValues((current) => ({ ...current, recipientPhone: event.target.value }))}
            placeholder="e.g. +919999999999"
          />
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

      {/* Rich content proposal editor */}
      <FieldGroup>
        <div className="flex justify-between items-center">
          <FieldLabel htmlFor="proposal-content">Proposal Content (Markdown Details)</FieldLabel>
          {values.content && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(values.content || "");
                  setCopiedContent(true);
                  setTimeout(() => setCopiedContent(false), 2000);
                } catch (err) {}
              }}
              className="text-xs text-black font-semibold hover:underline flex items-center gap-1"
            >
              {copiedContent ? "✅ Copied!" : "📋 Copy Content"}
            </button>
          )}
        </div>
        <TextArea
          id="proposal-content"
          value={values.content}
          onChange={(event) =>
            setValues((current) => ({ ...current, content: event.target.value }))
          }
          placeholder="### Project Overview&#10;Describe modules, milestone installments, deliverables, terms & conditions..."
          className="min-h-[220px]"
        />
      </FieldGroup>

      <div className="flex justify-end gap-3 border-t border-line pt-4">
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
