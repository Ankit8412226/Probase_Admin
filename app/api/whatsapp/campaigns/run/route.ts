import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { getLeads } from "@/lib/services/leads";
import { getClients } from "@/lib/services/clients";
import { updateCampaign, sendWhatsappAlert } from "@/lib/services/whatsapp";
import WhatsappCampaign from "@/models/WhatsappCampaign";

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const body = await request.json();
    const { campaignId, sessionId } = body;

    if (!campaignId) {
      return apiError("campaignId is required.", 400);
    }

    // Fetch the campaign
    const campaign = (await WhatsappCampaign.findById(campaignId).lean()) as unknown as import("@/types").WhatsappCampaignRecord | null;
    if (!campaign) {
      return apiError("Campaign not found.", 404);
    }

    if (campaign.status === "Running") {
      return apiError("This campaign is already running.", 400);
    }

    // Retrieve targets (Leads, Clients, or Custom)
    let targets: Array<{ name: string; phone?: string; company?: string }> = [];
    if (campaign.targetType === "Leads") {
      const leads = await getLeads();
      targets = leads.map(l => ({ name: l.name, phone: l.contact, company: l.source }));
    } else if (campaign.targetType === "Clients") {
      const clients = await getClients();
      targets = clients.map(c => ({ name: c.name, phone: c.phone, company: c.company }));
    } else {
      targets = campaign.customContacts || [];
    }

    // Filter valid phone numbers
    const validTargets = targets.filter(t => t.phone && t.phone.trim().length >= 8);

    if (validTargets.length === 0) {
      return apiError("No valid target contacts with phone numbers found.", 400);
    }

    // Update campaign status to Running
    await updateCampaign(campaignId, {
      status: "Running",
      totalCount: validTargets.length,
      sentCount: 0
    });

    // RUN BROADCAST ASYNCHRONOUSLY IN BACKGROUND
    // This allows Vercel serverless function to return 202 Accepted immediately
    // without timing out during long loops.
    runBroadcastInBackground(campaignId, validTargets, campaign.templateText, campaign.mediaUrl, sessionId || "default").catch(err => {
      console.error(`Campaign ${campaignId} background run failed:`, err);
    });

    return apiSuccess({ success: true, message: "Campaign broadcast started in background.", total: validTargets.length }, { status: 202 });
  } catch (error) {
    return handleApiException(error);
  }
}

async function runBroadcastInBackground(
  campaignId: string,
  targets: Array<{ name: string; phone?: string; company?: string; var1?: string; var2?: string; var3?: string }>,
  templateText: string,
  mediaUrl: string | undefined,
  sessionId: string
) {
  console.log(`[Campaign ${campaignId}] Starting background broadcast to ${targets.length} targets...`);

  let sentCount = 0;

  for (const target of targets) {
    if (!target.phone) continue;

    // Interpolate placeholders: {{name}}, {{company}}, {{phone}}, {{var1}}, {{var2}}, {{var3}}
    let text = templateText
      .replace(/\{\{name\}\}/gi, target.name)
      .replace(/\{\{company\}\}/gi, target.company || "Your Business")
      .replace(/\{\{phone\}\}/gi, target.phone)
      .replace(/\{\{var1\}\}/gi, target.var1 || "")
      .replace(/\{\{var2\}\}/gi, target.var2 || "")
      .replace(/\{\{var3\}\}/gi, target.var3 || "");

    try {
      await sendWhatsappAlert(
        target.name,
        target.phone,
        text,
        "test", // Type as test/campaign
        sessionId,
        mediaUrl
      );
      sentCount++;

      // Update progress in database
      await updateCampaign(campaignId, { sentCount });
    } catch (err) {
      console.error(`[Campaign ${campaignId}] Failed to send message to ${target.name}:`, err);
    }

    // 1.5-second anti-spam delay between broadcasts
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Update status to Completed
  await updateCampaign(campaignId, { status: "Completed" });
  console.log(`[Campaign ${campaignId}] Background broadcast finished successfully. Sent: ${sentCount}`);
}
