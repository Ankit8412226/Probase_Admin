import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, normalizeEmpty, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { createProposal, getProposals } from "@/lib/services/proposals";
import { proposalSchema } from "@/lib/validation/schemas";
import { getClientById } from "@/lib/services/clients";
import { sendWhatsappAlert } from "@/lib/services/whatsapp";

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
      "leadId",
      "recipientName",
      "recipientPhone",
      "sentDate",
    ]);
    const proposal = await createProposal(payload);

    // Trigger WhatsApp alert to client/recipient
    const targetPhone = proposal.recipientPhone || "";
    const targetName = proposal.recipientName || "Valued Client";

    if (targetPhone) {
      try {
        sendWhatsappAlert(
          targetName,
          targetPhone,
          `🏢 *New Proposal Submitted*\n\nDear ${targetName},\nWe have created a new proposal for your review: *"${proposal.title}"*\n\n*Amount:* ₹${proposal.amount.toLocaleString("en-IN")}\n*Valid Until:* ${proposal.validUntil}\n\nThank you,\nProbase Solution`,
          "proposal"
        ).catch((err) => console.error(err));
      } catch (err) {
        console.error("WhatsApp proposal alert failed:", err);
      }
    } else if (proposal.clientId) {
      try {
        const client = await getClientById(proposal.clientId);
        if (client && client.phone) {
          sendWhatsappAlert(
            client.name,
            client.phone,
            `🏢 *New Proposal Submitted*\n\nDear ${client.name},\nWe have created a new proposal for your review: *"${proposal.title}"*\n\n*Amount:* ₹${proposal.amount.toLocaleString("en-IN")}\n*Valid Until:* ${proposal.validUntil}\n\nThank you,\nProbase Solution`,
            "proposal"
          ).catch((err) => console.error(err));
        }
      } catch (err) {
        console.error("WhatsApp proposal alert failed:", err);
      }
    }

    return apiSuccess(proposal, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
