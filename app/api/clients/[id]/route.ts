import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, validateRequest } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { deleteClient, getClientById, updateClient } from "@/lib/services/clients";
import { clientSchema } from "@/lib/validation/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);
    const { id } = await params;
    const client = await getClientById(id);
    return client ? apiSuccess(client) : apiError("Client not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);
    const payload = await validateRequest(request, clientSchema.partial());
    const { id } = await params;
    const client = await updateClient(id, payload);
    return client ? apiSuccess(client) : apiError("Client not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);
    const { id } = await params;
    const deleted = await deleteClient(id);
    return deleted ? apiSuccess({ deleted: true }) : apiError("Client not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}
