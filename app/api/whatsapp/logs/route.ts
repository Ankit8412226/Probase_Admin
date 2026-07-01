import type { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { getWhatsappLogs } from "@/lib/services/whatsapp";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const logs = await getWhatsappLogs();
    return apiSuccess(logs);
  } catch (error) {
    return handleApiException(error);
  }
}
