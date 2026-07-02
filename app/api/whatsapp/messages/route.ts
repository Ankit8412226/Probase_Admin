import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { getWhatsappMessages } from "@/lib/services/whatsapp";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);
    const messages = await getWhatsappMessages();
    return apiSuccess(messages);
  } catch (error) {
    return handleApiException(error);
  }
}
