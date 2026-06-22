import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { createEmployee, getEmployees } from "@/lib/services/employees";
import { employeeSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const employees = await getEmployees();
    return apiSuccess(employees);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin"]);
    const payload = await validateRequest(request, employeeSchema);
    const employee = await createEmployee({
      name: payload.name,
      email: payload.email,
      role: payload.role,
      salary: payload.salary,
      joiningDate: payload.joiningDate,
      loginRole: payload.loginRole ? (payload.loginRole as any) : undefined,
      password: payload.password ? payload.password : undefined,
    });
    return apiSuccess(employee, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
