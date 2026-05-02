import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser(request);
    return apiSuccess(user);
  } catch (error) {
    return handleApiException(error);
  }
}
