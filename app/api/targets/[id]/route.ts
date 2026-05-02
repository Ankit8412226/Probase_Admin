import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, validateRequest } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { deleteTarget, getTargetById, updateTarget } from "@/lib/services/targets";
import { targetSchema } from "@/lib/validation/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const { id } = await params;
    const target = await getTargetById(id);
    return target ? apiSuccess(target) : apiError("Target not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const payload = await validateRequest(request, targetSchema.partial());
    const { id } = await params;
    const target = await updateTarget(id, payload);
    return target ? apiSuccess(target) : apiError("Target not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const { id } = await params;
    const deleted = await deleteTarget(id);
    return deleted ? apiSuccess({ deleted: true }) : apiError("Target not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}
