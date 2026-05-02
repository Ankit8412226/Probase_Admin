import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { getDashboardOverview, getEmployeePerformance } from "@/lib/services/analytics";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const [overview, performance] = await Promise.all([
      getDashboardOverview(),
      getEmployeePerformance(),
    ]);

    return apiSuccess({
      ...overview,
      employeePerformance: performance,
    });
  } catch (error) {
    return handleApiException(error);
  }
}
