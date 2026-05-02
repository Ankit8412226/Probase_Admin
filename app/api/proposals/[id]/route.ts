import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, normalizeEmpty, validateRequest } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import {
  deleteProposal,
  getProposalById,
  updateProposal,
} from "@/lib/services/proposals";
import { proposalSchema } from "@/lib/validation/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const { id } = await params;
    const proposal = await getProposalById(id);
    return proposal ? apiSuccess(proposal) : apiError("Proposal not found", 404);
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
    const payload = normalizeEmpty(await validateRequest(request, proposalSchema.partial()), [
      "clientId",
      "sentDate",
    ]);
    const { id } = await params;
    const proposal = await updateProposal(id, payload);
    return proposal ? apiSuccess(proposal) : apiError("Proposal not found", 404);
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
    const deleted = await deleteProposal(id);
    return deleted ? apiSuccess({ deleted: true }) : apiError("Proposal not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}
