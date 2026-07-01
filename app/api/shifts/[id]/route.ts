import type { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { getShiftById, updateShift, deleteShift } from "@/lib/services/shifts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const { id } = await params;
    const shift = await getShiftById(id);
    return shift ? apiSuccess(shift) : apiError("Shift not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const { id } = await params;
    const body = await request.json();

    const shift = await updateShift(id, body);
    return shift ? apiSuccess(shift) : apiError("Shift not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const { id } = await params;
    const deleted = await deleteShift(id);
    return deleted ? apiSuccess({ deleted: true }) : apiError("Shift not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}
