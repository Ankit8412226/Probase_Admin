import { mockData } from "@/lib/data/mock-data";
import type { SeedPayload } from "@/types";

declare global {
  var probaseStore: SeedPayload | undefined;
}

export function getMemoryStore() {
  if (!global.probaseStore) {
    global.probaseStore = structuredClone(mockData);
  }
  if (!global.probaseStore.attendances) {
    global.probaseStore.attendances = [];
  }
  if (!global.probaseStore.shifts) {
    global.probaseStore.shifts = [];
  }
  if (!global.probaseStore.whatsappLogs) {
    global.probaseStore.whatsappLogs = [];
  }

  return global.probaseStore;
}

export function resetMemoryStore() {
  global.probaseStore = structuredClone(mockData);
  return global.probaseStore;
}
