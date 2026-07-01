import { NextRequest } from "next/server";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess, apiError } from "@/lib/http";
import { createWhatsappMessage, getWhatsappRules, sendWhatsappAlert } from "@/lib/services/whatsapp";

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

    // --- FREE CHATBOT AUTO-RESPONDER TRIGGERS ---
    try {
      const rules = await getWhatsappRules();
      const lowercaseMsg = messageText.toLowerCase().trim();
      
      const matchedRule = rules.find(
        (r) => r.isActive && lowercaseMsg.includes(r.keyword.toLowerCase())
      );

      if (matchedRule) {
        console.log(`[Chatbot Matched Keyword: "${matchedRule.keyword}"] Autoreply triggering...`);
        
        // Dispatch in background
        sendWhatsappAlert(
          savedMessage.senderName,
          senderPhone,
          matchedRule.replyText,
          "test",
          sessionId || "default",
          matchedRule.mediaUrl
        ).catch(err => console.error("Chatbot response failed:", err));
      }
    } catch (chatbotErr) {
      console.error("Chatbot processing error:", chatbotErr);
    }

    return apiSuccess({ success: true, message: "Webhook processed and message logged." });
  } catch (error) {
    return handleApiException(error);
  }
}
