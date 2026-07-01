import { WhatsappLog, WhatsappConfig } from "@/models/WhatsappLog";
import WhatsappMessage from "@/models/WhatsappMessage";
import WhatsappCampaign from "@/models/WhatsappCampaign";
import WhatsappTemplate from "@/models/WhatsappTemplate";
import WhatsappRule from "@/models/WhatsappRule";
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

function getAppOrigin() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
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
        headers: { 
          "Content-Type": "application/json",
          "x-dashboard-url": getAppOrigin()
        },
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

// --- Custom Templates Library ---

export async function getWhatsappTemplates() {
  if (useMemoryStore()) {
    return getMemoryStore().whatsappTemplates || [];
  }

  await ensureDatabase();
  const templates = await WhatsappTemplate.find().sort({ createdAt: -1 }).lean();
  return templates.map((t) => mapDocument(t as any)) as unknown as import("@/types").WhatsappTemplateRecord[];
}

export async function createWhatsappTemplate(payload: Omit<import("@/types").WhatsappTemplateRecord, "id" | "createdAt">) {
  const record: import("@/types").WhatsappTemplateRecord = {
    id: createId("tpl"),
    ...payload,
    createdAt: new Date().toISOString(),
  };

  if (useMemoryStore()) {
    const store = getMemoryStore();
    store.whatsappTemplates = store.whatsappTemplates || [];
    store.whatsappTemplates.unshift(record);
    return record;
  }

  await ensureDatabase();
  await WhatsappTemplate.create({ _id: record.id, ...record });
  return record;
}

export async function deleteWhatsappTemplate(id: string) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    store.whatsappTemplates = store.whatsappTemplates?.filter((t) => t.id !== id) || [];
    return true;
  }

  await ensureDatabase();
  await WhatsappTemplate.findByIdAndDelete(id);
  return true;
}

// --- Chatbot Auto-Responder Rules ---

export async function getWhatsappRules() {
  if (useMemoryStore()) {
    return getMemoryStore().whatsappRules || [];
  }

  await ensureDatabase();
  const rules = await WhatsappRule.find().sort({ createdAt: -1 }).lean();
  return rules.map((r) => mapDocument(r as any)) as unknown as import("@/types").WhatsappRuleRecord[];
}

export async function createWhatsappRule(payload: Omit<import("@/types").WhatsappRuleRecord, "id" | "createdAt" | "isActive">) {
  const record: import("@/types").WhatsappRuleRecord = {
    id: createId("rule"),
    ...payload,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  if (useMemoryStore()) {
    const store = getMemoryStore();
    store.whatsappRules = store.whatsappRules || [];
    store.whatsappRules.unshift(record);
    return record;
  }

  await ensureDatabase();
  await WhatsappRule.create({ _id: record.id, ...record });
  return record;
}

export async function updateWhatsappRule(id: string, payload: Partial<Omit<import("@/types").WhatsappRuleRecord, "id">>) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    store.whatsappRules = store.whatsappRules || [];
    const idx = store.whatsappRules.findIndex((r) => r.id === id);
    if (idx >= 0) {
      store.whatsappRules[idx] = { ...store.whatsappRules[idx], ...payload };
      return store.whatsappRules[idx];
    }
    return null;
  }

  await ensureDatabase();
  const updated = await WhatsappRule.findByIdAndUpdate(id, payload, { new: true }).lean();
  return updated ? (mapDocument(updated as any) as unknown as import("@/types").WhatsappRuleRecord) : null;
}

export async function deleteWhatsappRule(id: string) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    store.whatsappRules = store.whatsappRules?.filter((r) => r.id !== id) || [];
    return true;
  }

  await ensureDatabase();
  await WhatsappRule.findByIdAndDelete(id);
  return true;
}
