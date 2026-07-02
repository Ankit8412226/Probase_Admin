import Shift from "@/models/Shift";
import { createId } from "@/lib/utils";
import { ensureDatabase, mapDocument, useMemoryStore, getCurrentTenantId } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { ShiftRecord } from "@/types";

export async function getShifts() {
  if (useMemoryStore()) {
    return [...(getMemoryStore().shifts || [])].sort((a, b) => a.name.localeCompare(b.name));
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const shifts = await Shift.find({ tenantId }).sort({ name: 1 }).lean();
  return shifts.map((item) => mapDocument(item as unknown as { _id: string } & ShiftRecord));
}

export async function getShiftById(id: string) {
  if (useMemoryStore()) {
    return getMemoryStore().shifts?.find((item) => item.id === id) ?? null;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const shift = await Shift.findOne({ _id: id, tenantId }).lean();
  return shift ? mapDocument(shift as unknown as { _id: string } & ShiftRecord) : null;
}

export async function createShift(payload: Omit<ShiftRecord, "id">) {
  const shift: ShiftRecord = {
    id: createId("shift"),
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (useMemoryStore()) {
    const store = getMemoryStore();
    store.shifts = store.shifts || [];
    store.shifts.unshift(shift);
    return shift;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  await Shift.create({ _id: shift.id, tenantId, ...shift });
  return shift;
}

export async function updateShift(id: string, payload: Partial<Omit<ShiftRecord, "id">>) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const index = store.shifts?.findIndex((item) => item.id === id) ?? -1;

    if (index < 0) {
      return null;
    }

    const updated = {
      ...store.shifts![index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    store.shifts![index] = updated;
    return updated;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const shift = await Shift.findOneAndUpdate(
    { _id: id, tenantId },
    { ...payload, updatedAt: new Date().toISOString() },
    { new: true }
  ).lean();
  return shift ? mapDocument(shift as unknown as { _id: string } & ShiftRecord) : null;
}

export async function deleteShift(id: string) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const previousLength = store.shifts?.length ?? 0;
    store.shifts = store.shifts?.filter((item) => item.id !== id) || [];
    return previousLength !== store.shifts.length;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const result = await Shift.deleteOne({ _id: id, tenantId });
  return result.deletedCount === 1;
}

export async function seedShifts(records: ShiftRecord[]) {
  if (useMemoryStore()) {
    getMemoryStore().shifts = structuredClone(records);
    return getMemoryStore().shifts;
  }

  await ensureDatabase();
  await Shift.deleteMany({});
  await Shift.insertMany(records.map((shift) => ({ _id: shift.id, tenantId: "demo_tenant", ...shift })));
  return getShifts();
}
