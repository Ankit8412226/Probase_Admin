import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { updateLead } from "@/lib/services/leads";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireApiUser(request, ["admin", "manager", "business"]);
    const { emailPitch } = await request.json();
    const lead = await updateLead(id, { emailPitch });
    if (!lead) {
      return Response.json({ success: false, message: "Lead not found" }, { status: 404 });
    }
    return apiSuccess(lead);
  } catch (error) {
    return handleApiException(error);
  }
}
