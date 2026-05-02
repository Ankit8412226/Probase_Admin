import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { createClient, getClients } from "@/lib/services/clients";
import { clientSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const clients = await getClients();
    return apiSuccess(clients);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const payload = await validateRequest(request, clientSchema);
    const client = await createClient(payload);
    return apiSuccess(client, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
