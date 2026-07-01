import { NextRequest } from "next/server";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { updateCampaign } from "@/lib/services/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, sentCount, status } = body;

    if (campaignId) {
      await updateCampaign(campaignId, {
        sentCount: Number(sentCount) || 0,
        status: status || "Running"
      });
      console.log(`[Campaign Callback] Updated Campaign ${campaignId}: sentCount=${sentCount}, status=${status}`);
    }

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiException(error);
  }
}
