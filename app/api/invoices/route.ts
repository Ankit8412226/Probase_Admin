import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, normalizeEmpty, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { createInvoice, getInvoices } from "@/lib/services/invoices";
import { invoiceSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const invoices = await getInvoices();
    return apiSuccess(invoices);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const payload = normalizeEmpty(await validateRequest(request, invoiceSchema), [
      "projectId",
      "paidDate",
    ]);
    const invoice = await createInvoice(payload);
    return apiSuccess(invoice, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
