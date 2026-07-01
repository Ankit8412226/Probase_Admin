import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { getCampaigns, createCampaign } from "@/lib/services/whatsapp";
import { z } from "zod";

const campaignCreateSchema = z.object({
  name: z.string().min(3),
  templateText: z.string().min(5),
  mediaUrl: z.string().optional().or(z.literal("")),
  targetType: z.enum(["Leads", "Clients"]),
});

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const campaigns = await getCampaigns();
    return apiSuccess(campaigns);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const payload = await validateRequest(request, campaignCreateSchema);
    const campaign = await createCampaign(payload);
    return apiSuccess(campaign, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
