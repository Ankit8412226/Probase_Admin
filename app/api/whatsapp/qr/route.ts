import type { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { getWhatsappConfig } from "@/lib/services/whatsapp";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const config = await getWhatsappConfig();

    if (!config.gatewayUrl || !config.gatewayUrl.trim().startsWith("http")) {
      return apiError("Please configure a valid WhatsApp Gateway URL in the settings panel first.", 400);
    }

    try {
      const res = await fetch(`${config.gatewayUrl.replace(/\/$/, "")}/qr`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        next: { revalidate: 0 } // Disable caching
      });

      if (!res.ok) {
        throw new Error(`Gateway returned status ${res.status}`);
      }

      const data = await res.json();
      return apiSuccess({ qr: data.qr }); // Expecting { qr: "base64-image" }
    } catch (err: any) {
      console.error("Failed to fetch QR from gateway:", err);
      return apiError(`Failed to fetch QR code from your gateway. Please check if your gateway at ${config.gatewayUrl} is online and running.`, 502);
    }
  } catch (error) {
    return handleApiException(error);
  }
}
