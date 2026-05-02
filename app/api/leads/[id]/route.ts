import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, normalizeEmpty, validateRequest } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { deleteLead, getLeadById, updateLead } from "@/lib/services/leads";
import { leadSchema } from "@/lib/validation/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const { id } = await params;
    const lead = await getLeadById(id);
    return lead ? apiSuccess(lead) : apiError("Lead not found", 404);
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
    const payload = normalizeEmpty(await validateRequest(request, leadSchema.partial()), [
      "expectedCloseDate",
      "lastContactDate",
      "convertedAt",
      "lostAt",
      "lostReason",
      "notes",
    ]);
    const { id } = await params;
    const lead = await updateLead(id, payload);
    return lead ? apiSuccess(lead) : apiError("Lead not found", 404);
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
    const deleted = await deleteLead(id);
    return deleted ? apiSuccess({ deleted: true }) : apiError("Lead not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}
