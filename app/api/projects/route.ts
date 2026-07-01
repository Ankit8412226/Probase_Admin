import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, normalizeEmpty, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { createProject, getProjects } from "@/lib/services/projects";
import { projectSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);
    const projects = await getProjects();
    return apiSuccess(projects);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const payload = normalizeEmpty(await validateRequest(request, projectSchema), ["endDate"]);
    const project = await createProject(payload);
    return apiSuccess(project, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
