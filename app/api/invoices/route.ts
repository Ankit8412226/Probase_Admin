import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, normalizeEmpty, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { createInvoice, getInvoices } from "@/lib/services/invoices";
import { invoiceSchema } from "@/lib/validation/schemas";
import { getClientById } from "@/lib/services/clients";
import { sendWhatsappAlert } from "@/lib/services/whatsapp";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);
    const invoices = await getInvoices();
    return apiSuccess(invoices);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);
    const payload = normalizeEmpty(await validateRequest(request, invoiceSchema), [
      "projectId",
      "paidDate",
    ]);
    const invoice = await createInvoice(payload);

    // Trigger WhatsApp alert to client
    if (invoice.clientId) {
      try {
        const client = await getClientById(invoice.clientId);
        if (client && client.phone) {
          sendWhatsappAlert(
            client.name,
            client.phone,
            `🏢 *Invoice Generated*\n\nDear ${client.name},\nInvoice *#${invoice.invoiceNumber}* has been issued for your project.\n\n*Amount Due:* ₹${invoice.amount.toLocaleString("en-IN")}\n*Due Date:* ${invoice.dueDate}\n*Status:* ${invoice.status}\n\nThank you,\nProbase Solution`,
            "invoice"
          ).catch((err) => console.error(err));
        }
      } catch (err) {
        console.error("WhatsApp invoice alert failed:", err);
      }
    }

    return apiSuccess(invoice, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
