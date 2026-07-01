import type { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { sendWhatsappAlert } from "@/lib/services/whatsapp";

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const body = await request.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return apiError("Recipient phone number and message are required", 400);
    }

    const log = await sendWhatsappAlert("Test Contact", phone, message, "test");
    return apiSuccess(log);
  } catch (error) {
    return handleApiException(error);
  }
}
