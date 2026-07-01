import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { getWhatsappRules, createWhatsappRule } from "@/lib/services/whatsapp";
import { z } from "zod";

const ruleCreateSchema = z.object({
  keyword: z.string().min(1),
  replyText: z.string().min(1),
  mediaUrl: z.string().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const rules = await getWhatsappRules();
    return apiSuccess(rules);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const payload = await validateRequest(request, ruleCreateSchema);
    const rule = await createWhatsappRule(payload);
    return apiSuccess(rule, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
