import { WhatsappLog, WhatsappConfig } from "@/models/WhatsappLog";
import { createId } from "@/lib/utils";
import { ensureDatabase, mapDocument, useMemoryStore } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { WhatsappLogRecord } from "@/types";

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
  type: "attendance" | "invoice" | "proposal" | "test"
) {
  const config = await getWhatsappConfig();
  const id = createId("wa");
  const createdAt = new Date().toISOString();
  
  let status: "Sent" | "Failed" = "Sent";

  if (config.gatewayUrl && config.gatewayUrl.trim().startsWith("http")) {
    try {
      // Outgoing request to self-hosted QR WhatsApp Web Gateway
      const res = await fetch(`${config.gatewayUrl.replace(/\/$/, "")}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message: text }),
      });

      if (!res.ok) {
        status = "Failed";
      }
    } catch (err) {
      console.error("WhatsApp Gateway connection failed:", err);
      status = "Failed";
    }
  } else {
    // If no gateway is configured yet, we simulate delivery
    // This allows instant sandbox testing for SaaS demonstration!
    console.log(`[Simulated WhatsApp to ${recipientName} (${phone})]: ${text}`);
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
