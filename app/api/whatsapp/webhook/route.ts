import { NextRequest } from "next/server";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess, apiError } from "@/lib/http";
import { createWhatsappMessage } from "@/lib/services/whatsapp";

// PUBLIC WEBHOOK: Receives incoming WhatsApp messages from the gateway
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderPhone, senderName, messageText, timestamp, sessionId } = body;

    if (!senderPhone || !messageText) {
      return apiError("Missing senderPhone or messageText in webhook payload", 400);
    }

    const savedMessage = await createWhatsappMessage({
      senderPhone,
      senderName: senderName || "WhatsApp User",
      messageText,
      timestamp: timestamp || new Date().toISOString(),
      sessionId: sessionId || "default",
    });

    console.log(`[Webhook Inbox Saved] Reply from ${savedMessage.senderName} (${savedMessage.senderPhone}): ${savedMessage.messageText}`);

    return apiSuccess({ success: true, message: "Webhook processed and message logged." });
  } catch (error) {
    return handleApiException(error);
  }
}
