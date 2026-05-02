import { connectToDatabase, hasMongoConnection } from "@/lib/db";

export function useMemoryStore() {
  return !hasMongoConnection();
}

function serializeDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return typeof value === "string" ? value : undefined;
}

export function mapDocument<T extends { _id: string; createdAt?: unknown; updatedAt?: unknown }>(
  document: T,
) {
  const { _id, createdAt, updatedAt, ...rest } = document;
  return {
    id: _id,
    ...rest,
    createdAt: serializeDate(createdAt),
    updatedAt: serializeDate(updatedAt),
  };
}

export async function ensureDatabase() {
  if (!hasMongoConnection()) {
    return null;
  }

  return connectToDatabase();
}
