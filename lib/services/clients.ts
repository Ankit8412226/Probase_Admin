import Client from "@/models/Client";
import { createId } from "@/lib/utils";
import { ensureDatabase, mapDocument, useMemoryStore, getCurrentTenantId } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { ClientRecord } from "@/types";

export async function getClients() {
  if (useMemoryStore()) {
    return [...getMemoryStore().clients].sort((a, b) => a.company.localeCompare(b.company));
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const clients = await Client.find({ tenantId }).sort({ createdAt: -1 }).lean();
  return clients.map((item) => mapDocument(item as unknown as { _id: string } & ClientRecord));
}

export async function getClientById(id: string) {
  if (useMemoryStore()) {
    return getMemoryStore().clients.find((item) => item.id === id) ?? null;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const client = await Client.findOne({ _id: id, tenantId }).lean();
  return client ? mapDocument(client as unknown as { _id: string } & ClientRecord) : null;
}

export async function createClient(payload: Omit<ClientRecord, "id">) {
  const client: ClientRecord = {
    id: createId("client"),
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (useMemoryStore()) {
    getMemoryStore().clients.unshift(client);
    return client;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  await Client.create({ _id: client.id, tenantId, ...client });
  return client;
}

export async function updateClient(id: string, payload: Partial<Omit<ClientRecord, "id">>) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const index = store.clients.findIndex((item) => item.id === id);

    if (index < 0) {
      return null;
    }

    store.clients[index] = {
      ...store.clients[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return store.clients[index];
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const client = await Client.findOneAndUpdate(
    { _id: id, tenantId },
    { ...payload, updatedAt: new Date().toISOString() },
    { new: true },
  ).lean();
  return client ? mapDocument(client as unknown as { _id: string } & ClientRecord) : null;
}

export async function deleteClient(id: string) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const previousLength = store.clients.length;
    store.clients = store.clients.filter((item) => item.id !== id);
    return previousLength !== store.clients.length;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const result = await Client.deleteOne({ _id: id, tenantId });
  return result.deletedCount === 1;
}

export async function seedClients(records: ClientRecord[]) {
  if (useMemoryStore()) {
    getMemoryStore().clients = structuredClone(records);
    return getMemoryStore().clients;
  }

  await ensureDatabase();
  await Client.deleteMany({});
  await Client.insertMany(records.map((client) => ({ _id: client.id, tenantId: "demo_tenant", ...client })));
  return getClients();
}
