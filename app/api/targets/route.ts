import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { createTarget, getTargets } from "@/lib/services/targets";
import { targetSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const targets = await getTargets();
    return apiSuccess(targets);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const payload = await validateRequest(request, targetSchema);
    const target = await createTarget(payload);
    return apiSuccess(target, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
