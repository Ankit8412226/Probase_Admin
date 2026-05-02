import Employee from "@/models/Employee";
import { createId } from "@/lib/utils";
import { ensureDatabase, mapDocument, useMemoryStore } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { EmployeeRecord } from "@/types";

export async function getEmployees() {
  if (useMemoryStore()) {
    return [...getMemoryStore().employees].sort((a, b) => a.name.localeCompare(b.name));
  }

  await ensureDatabase();
  const employees = await Employee.find().sort({ createdAt: -1 }).lean();
  return employees.map((item) => mapDocument(item as unknown as { _id: string } & EmployeeRecord));
}

export async function getEmployeeById(id: string) {
  if (useMemoryStore()) {
    return getMemoryStore().employees.find((item) => item.id === id) ?? null;
  }

  await ensureDatabase();
  const employee = await Employee.findById(id).lean();
  return employee
    ? mapDocument(employee as unknown as { _id: string } & EmployeeRecord)
    : null;
}

export async function createEmployee(payload: Omit<EmployeeRecord, "id">) {
  const employee: EmployeeRecord = {
    id: createId("emp"),
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (useMemoryStore()) {
    getMemoryStore().employees.unshift(employee);
    return employee;
  }

  await ensureDatabase();
  await Employee.create({
    _id: employee.id,
    ...employee,
  });
  return employee;
}

export async function updateEmployee(id: string, payload: Partial<Omit<EmployeeRecord, "id">>) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const index = store.employees.findIndex((item) => item.id === id);

    if (index < 0) {
      return null;
    }

    store.employees[index] = {
      ...store.employees[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    return store.employees[index];
  }

  await ensureDatabase();
  const employee = await Employee.findByIdAndUpdate(
    id,
    { ...payload, updatedAt: new Date().toISOString() },
    { new: true },
  ).lean();

  return employee
    ? mapDocument(employee as unknown as { _id: string } & EmployeeRecord)
    : null;
}

export async function deleteEmployee(id: string) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const previousLength = store.employees.length;
    store.employees = store.employees.filter((item) => item.id !== id);
    return previousLength !== store.employees.length;
  }

  await ensureDatabase();
  const result = await Employee.deleteOne({ _id: id });
  return result.deletedCount === 1;
}

export async function seedEmployees(records: EmployeeRecord[]) {
  if (useMemoryStore()) {
    getMemoryStore().employees = structuredClone(records);
    return getMemoryStore().employees;
  }

  await ensureDatabase();
  await Employee.deleteMany({});
  await Employee.insertMany(
    records.map((employee) => ({
      _id: employee.id,
      ...employee,
    })),
  );
  return getEmployees();
}
