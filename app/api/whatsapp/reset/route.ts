import type { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { getWhatsappConfig } from "@/lib/services/whatsapp";

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const config = await getWhatsappConfig();

    if (!config.gatewayUrl || !config.gatewayUrl.trim().startsWith("http")) {
      return apiError("Gateway URL not configured.", 400);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${config.gatewayUrl.replace(/\/$/, "")}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Gateway reset returned ${res.status}`);
      }

      const data = await res.json();
      return apiSuccess(data);
    } catch (err: any) {
      if (err.name === "AbortError") {
        return apiError("Gateway reset timed out. Server may be offline.", 504);
      }
      console.error("Failed to reset gateway:", err);
      return apiError("Failed to reset gateway session.", 502);
    }
  } catch (error) {
    return handleApiException(error);
  }
}
