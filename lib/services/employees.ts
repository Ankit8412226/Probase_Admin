import bcrypt from "bcryptjs";
import Employee from "@/models/Employee";
import User from "@/models/User";
import { createId } from "@/lib/utils";
import { ensureDatabase, mapDocument, useMemoryStore } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { EmployeeRecord, UserRecord, UserRole } from "@/types";

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
    name: payload.name,
    email: payload.email,
    role: payload.role,
    salary: payload.salary,
    joiningDate: payload.joiningDate,
    loginRole: payload.loginRole,
    password: payload.password,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (useMemoryStore()) {
    getMemoryStore().employees.unshift(employee);
    if (payload.loginRole && payload.password) {
      getMemoryStore().users.push({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: payload.loginRole,
        password: payload.password,
      });
    }
    return employee;
  }

  await ensureDatabase();
  await Employee.create({
    _id: employee.id,
    ...employee,
  });

  if (payload.loginRole && payload.password) {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    await User.create({
      _id: employee.id,
      name: employee.name,
      email: employee.email.toLowerCase(),
      role: payload.loginRole,
      password: hashedPassword,
    });
  }

  return employee;
}

export async function updateEmployee(id: string, payload: Partial<Omit<EmployeeRecord, "id">>) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const index = store.employees.findIndex((item) => item.id === id);

    if (index < 0) {
      return null;
    }

    const updatedEmployee = {
      ...store.employees[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    store.employees[index] = updatedEmployee;

    if (payload.loginRole || payload.password || payload.email || payload.name) {
      const userIndex = store.users.findIndex((u) => u.id === id);
      const email = payload.email ?? updatedEmployee.email;
      const name = payload.name ?? updatedEmployee.name;
      const loginRole = payload.loginRole ?? updatedEmployee.loginRole;
      const password = payload.password ?? updatedEmployee.password;

      if (loginRole && password) {
        const updatedUser: UserRecord = {
          id,
          name,
          email,
          role: loginRole,
          password,
        };
        if (userIndex >= 0) {
          store.users[userIndex] = updatedUser;
        } else {
          store.users.push(updatedUser);
        }
      }
    }

    return updatedEmployee;
  }

  await ensureDatabase();

  const existingEmployee = await Employee.findById(id).lean();
  if (!existingEmployee) return null;

  const updatedEmployeeDoc = await Employee.findByIdAndUpdate(
    id,
    { ...payload, updatedAt: new Date().toISOString() },
    { new: true },
  ).lean();

  if (!updatedEmployeeDoc) return null;

  const employee = mapDocument(updatedEmployeeDoc as unknown as { _id: string } & EmployeeRecord);

  if (payload.loginRole || payload.password || payload.email || payload.name) {
    const name = payload.name ?? employee.name;
    const email = (payload.email ?? employee.email).toLowerCase();
    const loginRole = payload.loginRole ?? (existingEmployee as any).loginRole;

    const existingUser = await User.findById(id);

    if (existingUser) {
      const userUpdate: any = { name, email };
      if (payload.loginRole) {
        userUpdate.role = payload.loginRole;
      }
      if (payload.password) {
        userUpdate.password = await bcrypt.hash(payload.password, 10);
      }
      await User.findByIdAndUpdate(id, userUpdate);
    } else if (loginRole && (payload.password || (existingEmployee as any).password)) {
      const passwordToUse = payload.password || (existingEmployee as any).password;
      await User.create({
        _id: id,
        name,
        email,
        role: loginRole,
        password: await bcrypt.hash(passwordToUse, 10),
      });
    }
  }

  return employee;
}

export async function deleteEmployee(id: string) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const previousLength = store.employees.length;
    store.employees = store.employees.filter((item) => item.id !== id);
    store.users = store.users.filter((item) => item.id !== id);
    return previousLength !== store.employees.length;
  }

  await ensureDatabase();
  const result = await Employee.deleteOne({ _id: id });
  await User.deleteOne({ _id: id });
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
