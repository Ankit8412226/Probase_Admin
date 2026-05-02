import type { NextRequest } from "next/server";

import { getSessionUser, requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return apiSuccess({
        authenticated: false,
        user: null,
      });
    }

    const confirmedUser = await requireApiUser(request);
    return apiSuccess({
      authenticated: true,
      user: confirmedUser,
    });
  } catch (error) {
    return handleApiException(error);
  }
}
