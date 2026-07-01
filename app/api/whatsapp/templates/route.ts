import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { getWhatsappTemplates, createWhatsappTemplate } from "@/lib/services/whatsapp";
import { z } from "zod";

const templateCreateSchema = z.object({
  name: z.string().min(3),
  templateText: z.string().min(5),
  mediaUrl: z.string().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const templates = await getWhatsappTemplates();
    return apiSuccess(templates);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const payload = await validateRequest(request, templateCreateSchema);
    const template = await createWhatsappTemplate(payload);
    return apiSuccess(template, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
