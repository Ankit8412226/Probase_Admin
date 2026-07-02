import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { updateWhatsappRule, deleteWhatsappRule } from "@/lib/services/whatsapp";
import { z } from "zod";

const ruleUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  keyword: z.string().optional(),
  replyText: z.string().optional(),
  mediaUrl: z.string().optional().or(z.literal("")),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);
    const { id } = await params;
    const payload = await validateRequest(request, ruleUpdateSchema);
    const updated = await updateWhatsappRule(id, payload);
    return apiSuccess(updated);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);
    const { id } = await params;
    await deleteWhatsappRule(id);
    return apiSuccess({ success: true, message: "Rule deleted successfully" });
  } catch (error) {
    return handleApiException(error);
  }
}
