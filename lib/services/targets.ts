import Target from "@/models/Target";
import { createId } from "@/lib/utils";
import { ensureDatabase, mapDocument, useMemoryStore, getCurrentTenantId } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { TargetRecord } from "@/types";

export async function getTargets() {
  if (useMemoryStore()) {
    return [...getMemoryStore().targets].sort((a, b) => b.month.localeCompare(a.month));
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const targets = await Target.find({ tenantId }).sort({ month: -1 }).lean();
  return targets.map((item) => mapDocument(item as unknown as { _id: string } & TargetRecord));
}

export async function getTargetById(id: string) {
  if (useMemoryStore()) {
    return getMemoryStore().targets.find((item) => item.id === id) ?? null;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const target = await Target.findOne({ _id: id, tenantId }).lean();
  return target ? mapDocument(target as unknown as { _id: string } & TargetRecord) : null;
}

export async function createTarget(payload: Omit<TargetRecord, "id">) {
  const target: TargetRecord = {
    id: createId("target"),
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (useMemoryStore()) {
    getMemoryStore().targets.unshift(target);
    return target;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  await Target.create({ _id: target.id, tenantId, ...target });
  return target;
}

export async function updateTarget(
  id: string,
  payload: Partial<Omit<TargetRecord, "id">>,
) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const index = store.targets.findIndex((item) => item.id === id);

    if (index < 0) {
      return null;
    }

    store.targets[index] = {
      ...store.targets[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return store.targets[index];
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const target = await Target.findOneAndUpdate(
    { _id: id, tenantId },
    { ...payload, updatedAt: new Date().toISOString() },
    { new: true },
  ).lean();
  return target ? mapDocument(target as unknown as { _id: string } & TargetRecord) : null;
}

export async function deleteTarget(id: string) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const previousLength = store.targets.length;
    store.targets = store.targets.filter((item) => item.id !== id);
    return previousLength !== store.targets.length;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const result = await Target.deleteOne({ _id: id, tenantId });
  return result.deletedCount === 1;
}

export async function seedTargets(records: TargetRecord[]) {
  if (useMemoryStore()) {
    getMemoryStore().targets = structuredClone(records);
    return getMemoryStore().targets;
  }

  await ensureDatabase();
  await Target.deleteMany({});
  await Target.insertMany(records.map((target) => ({ _id: target.id, tenantId: "demo_tenant", ...target })));
  return getTargets();
}
