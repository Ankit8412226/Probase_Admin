import type { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { getShifts, createShift } from "@/lib/services/shifts";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const shifts = await getShifts();
    return apiSuccess(shifts);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const body = await request.json();
    const { name, startTime, endTime, assignedEmployeeIds = [] } = body;

    if (!name || !startTime || !endTime) {
      return Response.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const shift = await createShift({ name, startTime, endTime, assignedEmployeeIds });
    return apiSuccess(shift, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
