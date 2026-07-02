import Salary from "@/models/Salary";
import { createId } from "@/lib/utils";
import { ensureDatabase, mapDocument, useMemoryStore, getCurrentTenantId } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { SalaryRecord } from "@/types";

export async function getSalaries() {
  if (useMemoryStore()) {
    return [...getMemoryStore().salaries].sort((a, b) => b.month.localeCompare(a.month));
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const salaries = await Salary.find({ tenantId }).sort({ month: -1 }).lean();
  return salaries.map((item) => mapDocument(item as unknown as { _id: string } & SalaryRecord));
}

export async function getSalaryById(id: string) {
  if (useMemoryStore()) {
    return getMemoryStore().salaries.find((item) => item.id === id) ?? null;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const salary = await Salary.findOne({ _id: id, tenantId }).lean();
  return salary ? mapDocument(salary as unknown as { _id: string } & SalaryRecord) : null;
}

export async function createSalary(payload: Omit<SalaryRecord, "id">) {
  const salary: SalaryRecord = {
    id: createId("sal"),
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (useMemoryStore()) {
    getMemoryStore().salaries.unshift(salary);
    return salary;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  await Salary.create({ _id: salary.id, tenantId, ...salary });
  return salary;
}

export async function updateSalary(id: string, payload: Partial<Omit<SalaryRecord, "id">>) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const index = store.salaries.findIndex((item) => item.id === id);

    if (index < 0) {
      return null;
    }

    store.salaries[index] = {
      ...store.salaries[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return store.salaries[index];
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const salary = await Salary.findOneAndUpdate(
    { _id: id, tenantId },
    { ...payload, updatedAt: new Date().toISOString() },
    { new: true },
  ).lean();
  return salary ? mapDocument(salary as unknown as { _id: string } & SalaryRecord) : null;
}

export async function deleteSalary(id: string) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const previousLength = store.salaries.length;
    store.salaries = store.salaries.filter((item) => item.id !== id);
    return previousLength !== store.salaries.length;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const result = await Salary.deleteOne({ _id: id, tenantId });
  return result.deletedCount === 1;
}

export async function seedSalaries(records: SalaryRecord[]) {
  if (useMemoryStore()) {
    getMemoryStore().salaries = structuredClone(records);
    return getMemoryStore().salaries;
  }

  await ensureDatabase();
  await Salary.deleteMany({});
  await Salary.insertMany(records.map((salary) => ({ _id: salary.id, tenantId: "demo_tenant", ...salary })));
  return getSalaries();
}
