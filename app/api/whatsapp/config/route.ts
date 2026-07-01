import type { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { getWhatsappConfig, saveWhatsappConfig } from "@/lib/services/whatsapp";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const config = await getWhatsappConfig();
    return apiSuccess(config);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const body = await request.json();
    const { gatewayUrl } = body;

    await saveWhatsappConfig(gatewayUrl || "");
    return apiSuccess({ success: true, message: "Gateway configuration updated" });
  } catch (error) {
    return handleApiException(error);
  }
}
