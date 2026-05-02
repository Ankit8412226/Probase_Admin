import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, normalizeEmpty, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { createLead, getLeads } from "@/lib/services/leads";
import { leadSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const leads = await getLeads();
    return apiSuccess(leads);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const payload = normalizeEmpty(await validateRequest(request, leadSchema), [
      "expectedCloseDate",
      "lastContactDate",
      "convertedAt",
      "lostAt",
      "lostReason",
      "notes",
    ]);
    const lead = await createLead(payload);
    return apiSuccess(lead, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
