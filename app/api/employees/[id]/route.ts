import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, validateRequest } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import {
  deleteEmployee,
  getEmployeeById,
  updateEmployee,
} from "@/lib/services/employees";
import { employeeSchema } from "@/lib/validation/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const { id } = await params;
    const employee = await getEmployeeById(id);
    return employee ? apiSuccess(employee) : apiError("Employee not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin"]);
    const payload = await validateRequest(request, employeeSchema.partial());
    const { id } = await params;
    const employee = await updateEmployee(id, {
      ...payload,
      loginRole: payload.loginRole ? (payload.loginRole as any) : undefined,
      password: payload.password ? payload.password : undefined,
    });
    return employee ? apiSuccess(employee) : apiError("Employee not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin"]);
    const { id } = await params;
    const deleted = await deleteEmployee(id);
    return deleted ? apiSuccess({ deleted: true }) : apiError("Employee not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}
