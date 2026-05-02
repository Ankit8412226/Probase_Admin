import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, normalizeEmpty, validateRequest } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import {
  deleteInvoice,
  getInvoiceById,
  updateInvoice,
} from "@/lib/services/invoices";
import { invoiceSchema } from "@/lib/validation/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const { id } = await params;
    const invoice = await getInvoiceById(id);
    return invoice ? apiSuccess(invoice) : apiError("Invoice not found", 404);
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
    const payload = normalizeEmpty(await validateRequest(request, invoiceSchema.partial()), [
      "projectId",
      "paidDate",
    ]);
    const { id } = await params;
    const invoice = await updateInvoice(id, payload);
    return invoice ? apiSuccess(invoice) : apiError("Invoice not found", 404);
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
    const deleted = await deleteInvoice(id);
    return deleted ? apiSuccess({ deleted: true }) : apiError("Invoice not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}
