import Lead from "@/models/Lead";
import { createId } from "@/lib/utils";
import { ensureDatabase, mapDocument, useMemoryStore } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { LeadRecord } from "@/types";

function deriveLeadStatus(stage: LeadRecord["stage"]): LeadRecord["status"] {
  if (stage === "Won") {
    return "Converted";
  }

  return "Not Converted";
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeLeadPayload<
  T extends {
    stage: LeadRecord["stage"];
    lostReason?: string;
    status?: LeadRecord["status"];
    convertedAt?: string;
    lostAt?: string;
  },
>(
  payload: T,
) {
  const status = deriveLeadStatus(payload.stage);

  if (payload.stage === "Won") {
    return {
      ...payload,
      status,
      convertedAt: payload.convertedAt || getTodayDateValue(),
      lostAt: undefined,
      lostReason: undefined,
    };
  }

  if (payload.stage === "Lost") {
    return {
      ...payload,
      status,
      convertedAt: undefined,
      lostAt: payload.lostAt || getTodayDateValue(),
      lostReason: payload.lostReason,
    };
  }

  return {
    ...payload,
    status,
    convertedAt: undefined,
    lostAt: undefined,
    lostReason: undefined,
  };
}

export async function getLeads() {
  if (useMemoryStore()) {
    return [...getMemoryStore().leads].sort((a, b) => a.name.localeCompare(b.name));
  }

  await ensureDatabase();
  const leads = await Lead.find().sort({ createdAt: -1 }).lean();
  return leads.map((item) => mapDocument(item as unknown as { _id: string } & LeadRecord));
}

export async function getLeadById(id: string) {
  if (useMemoryStore()) {
    return getMemoryStore().leads.find((item) => item.id === id) ?? null;
  }

  await ensureDatabase();
  const lead = await Lead.findById(id).lean();
  return lead ? mapDocument(lead as unknown as { _id: string } & LeadRecord) : null;
}

export async function createLead(payload: Omit<LeadRecord, "id">) {
  const lead: LeadRecord = {
    id: createId("lead"),
    ...normalizeLeadPayload(payload),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (useMemoryStore()) {
    getMemoryStore().leads.unshift(lead);
    return lead;
  }

  await ensureDatabase();
  await Lead.create({ _id: lead.id, ...lead });
  return lead;
}

export async function updateLead(id: string, payload: Partial<Omit<LeadRecord, "id">>) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const index = store.leads.findIndex((item) => item.id === id);

    if (index < 0) {
      return null;
    }

    const nextLead = {
      ...store.leads[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    store.leads[index] = normalizeLeadPayload(nextLead);
    return store.leads[index];
  }

  await ensureDatabase();
  const currentLead = await Lead.findById(id).lean();

  if (!currentLead) {
    return null;
  }

  const normalized = normalizeLeadPayload({
    ...(mapDocument(currentLead as unknown as { _id: string } & LeadRecord) as LeadRecord),
    ...payload,
  });
  const lead = await Lead.findByIdAndUpdate(
    id,
    { ...normalized, updatedAt: new Date().toISOString() },
    { new: true },
  ).lean();
  return lead ? mapDocument(lead as unknown as { _id: string } & LeadRecord) : null;
}

export async function deleteLead(id: string) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const previousLength = store.leads.length;
    store.leads = store.leads.filter((item) => item.id !== id);
    return previousLength !== store.leads.length;
  }

  await ensureDatabase();
  const result = await Lead.deleteOne({ _id: id });
  return result.deletedCount === 1;
}

export async function seedLeads(records: LeadRecord[]) {
  const normalizedRecords = records.map((record) => normalizeLeadPayload(record) as LeadRecord);

  if (useMemoryStore()) {
    getMemoryStore().leads = structuredClone(normalizedRecords);
    return getMemoryStore().leads;
  }

  await ensureDatabase();
  await Lead.deleteMany({});
  await Lead.insertMany(normalizedRecords.map((lead) => ({ _id: lead.id, ...lead })));
  return getLeads();
}
