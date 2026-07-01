import type { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { getAttendances } from "@/lib/services/attendance";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const attendances = await getAttendances();
    return apiSuccess(attendances);
  } catch (error) {
    return handleApiException(error);
  }
}
