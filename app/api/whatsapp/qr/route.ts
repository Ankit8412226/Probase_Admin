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

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId") || "default";

    const origin = request.nextUrl.origin;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout limit

      const res = await fetch(`${config.gatewayUrl.replace(/\/$/, "")}/qr?sessionId=${sessionId}`, {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "x-dashboard-url": origin
        },
        signal: controller.signal,
        next: { revalidate: 0 } // Disable caching
      });

      clearTimeout(timeoutId);

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
