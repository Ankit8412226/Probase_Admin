import bcrypt from "bcryptjs";

import User from "@/models/User";
import { ensureDatabase, mapDocument, useMemoryStore } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { AuthUser, UserRecord } from "@/types";

export async function getUsers() {
  if (useMemoryStore()) {
    return getMemoryStore().users;
  }

  await ensureDatabase();
  const users = await User.find().lean();
  return users.map((item) => mapDocument(item as unknown as { _id: string } & UserRecord));
}

export async function getBusinessUsers() {
  const users = await getUsers();
  return users.filter((user) => user.role === "business").map(sanitizeUser);
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = email.toLowerCase();

  if (useMemoryStore()) {
    return getMemoryStore().users.find((user) => user.email.toLowerCase() === normalizedEmail) ?? null;
  }

  await ensureDatabase();
  const user = await User.findOne({ email: normalizedEmail }).lean();

  if (!user) {
    return null;
  }

  return mapDocument(user as unknown as { _id: string } & UserRecord);
}

export function sanitizeUser(user: UserRecord): AuthUser {
  const { password, ...rest } = user;
  return rest;
}

export async function upsertUsers(users: UserRecord[]) {
  if (useMemoryStore()) {
    getMemoryStore().users = users;
    return getMemoryStore().users;
  }

  await ensureDatabase();
  await User.deleteMany({});

  const preparedUsers = await Promise.all(
    users.map(async (user) => ({
      _id: user.id,
      name: user.name,
      email: user.email.toLowerCase(),
      role: user.role,
      password: user.password.startsWith("$2")
        ? user.password
        : await bcrypt.hash(user.password, 10),
    })),
  );

  await User.insertMany(preparedUsers);
  return getUsers();
}
