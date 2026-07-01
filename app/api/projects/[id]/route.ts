import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, normalizeEmpty, validateRequest } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { deleteProject, getProjectById, updateProject } from "@/lib/services/projects";
import { projectSchema } from "@/lib/validation/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);
    const { id } = await params;
    const project = await getProjectById(id);
    return project ? apiSuccess(project) : apiError("Project not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const payload = normalizeEmpty(await validateRequest(request, projectSchema.partial()), [
      "endDate",
    ]);
    const { id } = await params;
    const project = await updateProject(id, payload);
    return project ? apiSuccess(project) : apiError("Project not found", 404);
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
    const deleted = await deleteProject(id);
    return deleted ? apiSuccess({ deleted: true }) : apiError("Project not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}
