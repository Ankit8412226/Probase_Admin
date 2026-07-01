import { WhatsappLog, WhatsappConfig } from "@/models/WhatsappLog";
import WhatsappMessage from "@/models/WhatsappMessage";
import WhatsappCampaign from "@/models/WhatsappCampaign";
import { createId } from "@/lib/utils";
import { ensureDatabase, mapDocument, useMemoryStore } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { WhatsappLogRecord, WhatsappMessageRecord, WhatsappCampaignRecord } from "@/types";

// Memory store fallback keys
let memoryConfig = { gatewayUrl: "" };

export async function getWhatsappConfig() {
  if (useMemoryStore()) {
    return memoryConfig;
  }

  await ensureDatabase();
  const config = await WhatsappConfig.findById("config").lean();
  return config ? { gatewayUrl: (config as any).gatewayUrl } : { gatewayUrl: "" };
}

export async function saveWhatsappConfig(gatewayUrl: string) {
  if (useMemoryStore()) {
    memoryConfig.gatewayUrl = gatewayUrl;
    return true;
  }

  await ensureDatabase();
  await WhatsappConfig.findByIdAndUpdate(
    "config",
    { gatewayUrl },
    { upsert: true, new: true }
  );
  return true;
}

export async function getWhatsappLogs() {
  if (useMemoryStore()) {
    return [...(getMemoryStore().whatsappLogs || [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  await ensureDatabase();
  const logs = await WhatsappLog.find().sort({ createdAt: -1 }).lean();
  return logs.map((item) =>
    mapDocument(item as unknown as { _id: string } & WhatsappLogRecord)
  ) as unknown as WhatsappLogRecord[];
}

export async function sendWhatsappAlert(
  recipientName: string,
  phone: string,
  text: string,
  type: "attendance" | "invoice" | "proposal" | "test",
  sessionId: string = "default",
  mediaUrl?: string
) {
  const config = await getWhatsappConfig();
  const id = createId("wa");
  const createdAt = new Date().toISOString();
  
  let status: "Sent" | "Failed" = "Sent";

  if (config.gatewayUrl && config.gatewayUrl.trim().startsWith("http")) {
    try {
      const res = await fetch(`${config.gatewayUrl.replace(/\/$/, "")}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message: text, sessionId, mediaUrl }),
      });

      if (!res.ok) {
        status = "Failed";
      }
    } catch (err) {
      console.error("WhatsApp Gateway connection failed:", err);
      status = "Failed";
    }
  } else {
    console.log(`[Simulated WhatsApp to ${recipientName} (${phone})]: ${text} | Media: ${mediaUrl || "None"}`);
    status = "Sent";
  }

  const logRecord: WhatsappLogRecord = {
    id,
    recipientName,
    recipientPhone: phone,
    message: text,
    status,
    type,
    createdAt,
  };

  if (useMemoryStore()) {
    const store = getMemoryStore();
    store.whatsappLogs = store.whatsappLogs || [];
    store.whatsappLogs.unshift(logRecord);
    return logRecord;
  }

  await ensureDatabase();
  await WhatsappLog.create({ _id: id, ...logRecord });
  return logRecord;
}

// --- Incoming Messages (Inbox) ---

export async function getWhatsappMessages() {
  if (useMemoryStore()) {
    return getMemoryStore().whatsappMessages || [];
  }

  await ensureDatabase();
  const msgs = await WhatsappMessage.find().sort({ createdAt: -1 }).lean();
  return msgs.map((m) => mapDocument(m as any)) as unknown as WhatsappMessageRecord[];
}

export async function createWhatsappMessage(payload: Omit<WhatsappMessageRecord, "id">) {
  const record: WhatsappMessageRecord = {
    id: createId("msg"),
    ...payload,
  };

  if (useMemoryStore()) {
    const store = getMemoryStore();
    store.whatsappMessages = store.whatsappMessages || [];
    store.whatsappMessages.unshift(record);
    return record;
  }

  await ensureDatabase();
  await WhatsappMessage.create({ _id: record.id, ...record });
  return record;
}

// --- Broadcast Campaigns ---

export async function getCampaigns() {
  if (useMemoryStore()) {
    return getMemoryStore().whatsappCampaigns || [];
  }

  await ensureDatabase();
  const campaigns = await WhatsappCampaign.find().sort({ createdAt: -1 }).lean();
  return campaigns.map((c) => mapDocument(c as any)) as unknown as WhatsappCampaignRecord[];
}

export async function createCampaign(payload: Omit<WhatsappCampaignRecord, "id" | "sentCount" | "status" | "createdAt" | "totalCount">) {
  const campaign: WhatsappCampaignRecord = {
    id: createId("camp"),
    ...payload,
    status: "Draft",
    sentCount: 0,
    totalCount: 0,
    createdAt: new Date().toISOString(),
  };

  if (useMemoryStore()) {
    const store = getMemoryStore();
    store.whatsappCampaigns = store.whatsappCampaigns || [];
    store.whatsappCampaigns.unshift(campaign);
    return campaign;
  }

  await ensureDatabase();
  await WhatsappCampaign.create({ _id: campaign.id, ...campaign });
  return campaign;
}

export async function updateCampaign(id: string, payload: Partial<Omit<WhatsappCampaignRecord, "id">>) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    store.whatsappCampaigns = store.whatsappCampaigns || [];
    const idx = store.whatsappCampaigns.findIndex((c) => c.id === id);
    if (idx >= 0) {
      store.whatsappCampaigns[idx] = { ...store.whatsappCampaigns[idx], ...payload };
      return store.whatsappCampaigns[idx];
    }
    return null;
  }

  await ensureDatabase();
  const updated = await WhatsappCampaign.findByIdAndUpdate(id, payload, { new: true }).lean();
  return updated ? (mapDocument(updated as any) as unknown as WhatsappCampaignRecord) : null;
}
