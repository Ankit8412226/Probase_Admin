import Proposal from "@/models/Proposal";
import { createId } from "@/lib/utils";
import { ensureDatabase, mapDocument, useMemoryStore, getCurrentTenantId } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { ProposalRecord } from "@/types";

export async function getProposals() {
  if (useMemoryStore()) {
    return [...getMemoryStore().proposals].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
    );
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const proposals = await Proposal.find({ tenantId }).sort({ createdAt: -1 }).lean();
  return proposals.map((item) =>
    mapDocument(item as unknown as { _id: string } & ProposalRecord),
  );
}

export async function getProposalById(id: string) {
  if (useMemoryStore()) {
    return getMemoryStore().proposals.find((item) => item.id === id) ?? null;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const proposal = await Proposal.findOne({ _id: id, tenantId }).lean();
  return proposal
    ? mapDocument(proposal as unknown as { _id: string } & ProposalRecord)
    : null;
}

export async function createProposal(payload: Omit<ProposalRecord, "id">) {
  const proposal: ProposalRecord = {
    id: createId("prop"),
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (useMemoryStore()) {
    getMemoryStore().proposals.unshift(proposal);
    return proposal;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  await Proposal.create({ _id: proposal.id, tenantId, ...proposal });
  return proposal;
}

export async function updateProposal(
  id: string,
  payload: Partial<Omit<ProposalRecord, "id">>,
) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const index = store.proposals.findIndex((item) => item.id === id);

    if (index < 0) {
      return null;
    }

    store.proposals[index] = {
      ...store.proposals[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return store.proposals[index];
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const proposal = await Proposal.findOneAndUpdate(
    { _id: id, tenantId },
    { ...payload, updatedAt: new Date().toISOString() },
    { new: true },
  ).lean();
  return proposal
    ? mapDocument(proposal as unknown as { _id: string } & ProposalRecord)
    : null;
}

export async function deleteProposal(id: string) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const previousLength = store.proposals.length;
    store.proposals = store.proposals.filter((item) => item.id !== id);
    return previousLength !== store.proposals.length;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const result = await Proposal.deleteOne({ _id: id, tenantId });
  return result.deletedCount === 1;
}

export async function seedProposals(records: ProposalRecord[]) {
  if (useMemoryStore()) {
    getMemoryStore().proposals = structuredClone(records);
    return getMemoryStore().proposals;
  }

  await ensureDatabase();
  await Proposal.deleteMany({});
  await Proposal.insertMany(records.map((proposal) => ({ _id: proposal.id, tenantId: "demo_tenant", ...proposal })));
  return getProposals();
}
