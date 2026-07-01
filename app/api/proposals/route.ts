import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, normalizeEmpty, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { createProposal, getProposals } from "@/lib/services/proposals";
import { proposalSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);
    const proposals = await getProposals();
    return apiSuccess(proposals);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);
    const payload = normalizeEmpty(await validateRequest(request, proposalSchema), [
      "clientId",
      "sentDate",
    ]);
    const proposal = await createProposal(payload);
    return apiSuccess(proposal, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
