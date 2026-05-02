import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { getBusinessOverview } from "@/lib/services/analytics";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const overview = await getBusinessOverview();
    return apiSuccess(overview);
  } catch (error) {
    return handleApiException(error);
  }
}
