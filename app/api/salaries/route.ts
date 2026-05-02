import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, normalizeEmpty, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { createSalary, getSalaries } from "@/lib/services/salaries";
import { salarySchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const salaries = await getSalaries();
    return apiSuccess(salaries);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin"]);
    const payload = normalizeEmpty(await validateRequest(request, salarySchema), ["paidDate"]);
    const salary = await createSalary(payload);
    return apiSuccess(salary, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
