import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, normalizeEmpty, validateRequest } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { deleteSalary, getSalaryById, updateSalary } from "@/lib/services/salaries";
import { salarySchema } from "@/lib/validation/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const { id } = await params;
    const salary = await getSalaryById(id);
    return salary ? apiSuccess(salary) : apiError("Salary record not found", 404);
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
    const payload = normalizeEmpty(await validateRequest(request, salarySchema.partial()), [
      "paidDate",
    ]);
    const { id } = await params;
    const salary = await updateSalary(id, payload);
    return salary ? apiSuccess(salary) : apiError("Salary record not found", 404);
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
    const deleted = await deleteSalary(id);
    return deleted ? apiSuccess({ deleted: true }) : apiError("Salary record not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}
