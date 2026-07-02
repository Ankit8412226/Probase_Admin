import { WhatsappModule } from "@/components/modules/whatsapp-module";
import { requireSessionUser } from "@/lib/auth";
import { getWhatsappLogs, getWhatsappConfig } from "@/lib/services/whatsapp";

export default async function WhatsappCampaignsPage() {
  await requireSessionUser(["admin", "manager", "business", "employee"]);
  const [logs, config] = await Promise.all([getWhatsappLogs(), getWhatsappConfig()]);

  return <WhatsappModule initialLogs={logs} initialConfig={config} defaultTab="campaigns" />;
}
