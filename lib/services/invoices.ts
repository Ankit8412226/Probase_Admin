import Invoice from "@/models/Invoice";
import { createId } from "@/lib/utils";
import { ensureDatabase, mapDocument, useMemoryStore } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { InvoiceRecord } from "@/types";

export async function getInvoices() {
  if (useMemoryStore()) {
    return [...getMemoryStore().invoices].sort((a, b) =>
      (b.issueDate ?? "").localeCompare(a.issueDate ?? ""),
    );
  }

  await ensureDatabase();
  const invoices = await Invoice.find().sort({ createdAt: -1 }).lean();
  return invoices.map((item) =>
    mapDocument(item as unknown as { _id: string } & InvoiceRecord),
  );
}

export async function getInvoiceById(id: string) {
  if (useMemoryStore()) {
    return getMemoryStore().invoices.find((item) => item.id === id) ?? null;
  }

  await ensureDatabase();
  const invoice = await Invoice.findById(id).lean();
  return invoice ? mapDocument(invoice as unknown as { _id: string } & InvoiceRecord) : null;
}

export async function createInvoice(payload: Omit<InvoiceRecord, "id">) {
  const invoice: InvoiceRecord = {
    id: createId("inv"),
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (useMemoryStore()) {
    getMemoryStore().invoices.unshift(invoice);
    return invoice;
  }

  await ensureDatabase();
  await Invoice.create({ _id: invoice.id, ...invoice });
  return invoice;
}

export async function updateInvoice(
  id: string,
  payload: Partial<Omit<InvoiceRecord, "id">>,
) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const index = store.invoices.findIndex((item) => item.id === id);

    if (index < 0) {
      return null;
    }

    store.invoices[index] = {
      ...store.invoices[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return store.invoices[index];
  }

  await ensureDatabase();
  const invoice = await Invoice.findByIdAndUpdate(
    id,
    { ...payload, updatedAt: new Date().toISOString() },
    { new: true },
  ).lean();
  return invoice ? mapDocument(invoice as unknown as { _id: string } & InvoiceRecord) : null;
}

export async function deleteInvoice(id: string) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const previousLength = store.invoices.length;
    store.invoices = store.invoices.filter((item) => item.id !== id);
    return previousLength !== store.invoices.length;
  }

  await ensureDatabase();
  const result = await Invoice.deleteOne({ _id: id });
  return result.deletedCount === 1;
}

export async function seedInvoices(records: InvoiceRecord[]) {
  if (useMemoryStore()) {
    getMemoryStore().invoices = structuredClone(records);
    return getMemoryStore().invoices;
  }

  await ensureDatabase();
  await Invoice.deleteMany({});
  await Invoice.insertMany(records.map((invoice) => ({ _id: invoice.id, ...invoice })));
  return getInvoices();
}
