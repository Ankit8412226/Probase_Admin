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
      return apiSuccess({ status: "DISCONNECTED", message: "Gateway not configured" });
    }

    try {
      const res = await fetch(`${config.gatewayUrl.replace(/\/$/, "")}/status`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        next: { revalidate: 0 }
      });

      if (!res.ok) {
        throw new Error(`Gateway status returned ${res.status}`);
      }

      const data = await res.json();
      return apiSuccess({ status: data.status }); // Expecting { status: "CONNECTED" | "QR" | "INITIALIZING" }
    } catch (err: any) {
      console.error("Failed to fetch status from gateway:", err);
      return apiSuccess({ status: "OFFLINE", message: "Gateway server is offline" });
    }
  } catch (error) {
    return handleApiException(error);
  }
}
